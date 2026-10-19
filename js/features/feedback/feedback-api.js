// Posts feedback to the organisers' Google Apps Script through a hidden form and
// iframe, and resolves only when the script confirms it through postMessage.
export function sendFeedbackToGoogle(endpoint, data) {
  return new Promise((resolve, reject) => {
    if (!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint)) {
      reject(new Error('Khảo sát chưa được kết nối. Câu trả lời đã được giữ trên thiết bị này để bạn gửi lại sau.'));
      return;
    }
    const channel = crypto.randomUUID(),
      frame = document.createElement('iframe'),
      form = document.createElement('form');
    frame.name = 'liber-feedback-' + channel;
    frame.hidden = true;
    frame.title = 'Gửi phản hồi tới Liber';
    form.method = 'POST';
    form.action = endpoint;
    form.target = frame.name;
    form.hidden = true;
    const input = document.createElement('input');
    input.name = 'payload';
    input.value = JSON.stringify({ ...data, channel });
    form.append(input);
    let timer;
    const cleanup = () => {
      clearTimeout(timer);
      window.removeEventListener('message', receive);
      form.remove();
      frame.remove();
    };
    const receive = (event) => {
      let host;
      try {
        const origin = new URL(event.origin);
        if (origin.protocol !== 'https:') return;
        host = origin.hostname;
      } catch {
        return;
      }
      if (
        host !== 'script.google.com' &&
        host !== 'script.googleusercontent.com' &&
        !host.endsWith('-script.googleusercontent.com')
      )
        return;
      const r = event.data;
      if (!r || r.type !== 'liber-feedback-result' || r.channel !== channel || r.requestId !== data.requestId) return;
      cleanup();
      if (r.ok === true) resolve(r);
      else reject(new Error(r.message || 'Chưa lưu được phản hồi. Bạn thử gửi lại nhé.'));
    };
    window.addEventListener('message', receive);
    document.body.append(frame, form);
    timer = setTimeout(() => {
      cleanup();
      reject(
        new Error(
          'Chưa nhận được xác nhận từ Google. Câu trả lời vẫn được giữ lại; bạn kiểm tra mạng rồi nhấn gửi lại nhé.',
        ),
      );
    }, 35000);
    form.submit();
  });
}

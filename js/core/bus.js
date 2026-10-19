// Features never import each other; they announce what happened here instead.
// Dispatch is synchronous, and a throwing listener does not stop the others.
//
// Events:
//   route:leave          a page transition starts
//   route:show {id}      the new page is visible, before its entrance animation
//   route:settled {id}   the page transition has finished
//   session:start        a recipient unlocked their card
//   session:reset        the visitor chose to change name
//   heart:complete       the heart slider reached 100%
//   audio:autoplay       start background music unless it is already playing
//   celebration:opening  the celebration dialog is about to open
//   celebration:closed   the celebration dialog has closed
//   ending:show          switch the celebration dialog to the ending card
const target = new EventTarget();

export function on(name, handler) {
  target.addEventListener(name, (event) => handler(event.detail));
}

export function emit(name, detail) {
  target.dispatchEvent(new CustomEvent(name, { detail }));
}

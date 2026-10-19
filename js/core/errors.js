function report(name, error) {
  console.error(`[liber] ${name} failed to start`, error);
}

export function safeInit(name, init) {
  try {
    init();
    return true;
  } catch (error) {
    report(name, error);
    return false;
  }
}

// Loading through import() keeps even a network or syntax error in one
// feature from stopping the others.
export function loadFeature(name, load) {
  return load().then(
    (module) => safeInit(name, module.init),
    (error) => {
      report(name, error);
      return false;
    },
  );
}

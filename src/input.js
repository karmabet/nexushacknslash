export function mobileControls({touchPoints=0, coarse=false, fine=false, mobile=false}) { return touchPoints > 0 && coarse && (mobile || !fine); }
export function movementAxes(keys) { return { x: Number(!!(keys.keyd || keys.arrowright))-Number(!!(keys.keya || keys.arrowleft)), y: Number(!!(keys.keyw || keys.arrowup))-Number(!!(keys.keys || keys.arrowdown)) }; }

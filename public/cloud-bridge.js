/* Cloud deployment uses HTTP polling through /api, keeping session cookies same-origin. */
if (typeof wsReconnectTimer !== 'undefined' && wsReconnectTimer) {
  clearTimeout(wsReconnectTimer);
  wsReconnectTimer = null;
}
if (typeof wsConn !== 'undefined' && wsConn) {
  wsConn.onclose = null;
  wsConn.close();
  wsConn = null;
}
connectWebSocket = function () {
  const indicator = document.getElementById('wsStatusIndicator');
  if (indicator) indicator.textContent = 'HTTP polling';
};

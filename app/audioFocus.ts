// A newly started track owns the listening space, including the home soundtrack.
export function focusAudio(active: HTMLAudioElement) {
  document.querySelectorAll('audio').forEach(audio => { if (audio !== active) audio.pause(); });
  document.querySelectorAll<HTMLIFrameElement>('iframe[src*="youtube-nocookie.com/embed"]').forEach(frame => {
    frame.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), 'https://www.youtube-nocookie.com');
  });
}

const scenes = [...document.querySelectorAll('.scene')];
const show = id => {
  scenes.forEach(s => s.classList.toggle('active', s.id === id));
  window.setTimeout(() => document.getElementById(id)?.focus?.(), 50);
};

document.querySelectorAll('[data-next]').forEach(button => {
  button.addEventListener('click', () => show(button.dataset.next));
});

const waitButton = document.querySelector('#wait-call');
const callStatus = document.querySelector('#call-status');
waitButton.addEventListener('click', () => {
  waitButton.disabled = true;
  callStatus.textContent = '胆子不小，连寿星的特权都用在我身上了？';
  setTimeout(() => {
    callStatus.textContent = '还在等你接听……';
    waitButton.disabled = false;
  }, 3000);
});
document.querySelector('#accept-call').addEventListener('click', () => show('dialogue'));

const dialogueLines = [
  '生日还打算一个人待着？',
  '下来，我在等你。',
  '至于去哪儿——今晚你说了算。'
];
let dialogueIndex = 0;
document.querySelector('#dialogue-next').addEventListener('click', () => {
  dialogueIndex += 1;
  if (dialogueIndex >= dialogueLines.length) return show('routes');
  document.querySelector('#dialogue-title').textContent = dialogueLines[dialogueIndex];
});

document.querySelectorAll('.route-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelector('#chosen-route').textContent = `ROUTE · ${card.dataset.route}`;
    document.querySelector('#route-line').textContent = card.dataset.line;
    document.querySelector('#ride-photo').src = card.dataset.image;
    document.querySelector('#ride-photo').alt = `萧逸 · ${card.dataset.route}路线`;
    show('ride');
  });
});

const hold = document.querySelector('#hold-button');
const progress = hold.querySelector('.progress');
const caption = document.querySelector('#ride-caption');
let holdFrame = 0;
let holdStart = 0;
let completed = false;
const messages = ['坐稳。', '别怕，我在。', '前面的路都交给我。', '到了。睁开眼。'];
let activeHoldPointer = null;
const stopHold = event => {
  if (event && activeHoldPointer !== null && event.pointerId !== activeHoldPointer) return;
  cancelAnimationFrame(holdFrame);
  if (activeHoldPointer !== null && hold.hasPointerCapture?.(activeHoldPointer)) hold.releasePointerCapture(activeHoldPointer);
  activeHoldPointer = null;
  if (!completed) {
    progress.style.strokeDashoffset = 339.3;
    caption.textContent = '长按，不要松手';
    document.querySelector('#ride').classList.remove('racing');
  }
};
const tickHold = time => {
  const ratio = Math.min((time - holdStart) / 2800, 1);
  progress.style.strokeDashoffset = 339.3 * (1 - ratio);
  caption.textContent = messages[Math.min(Math.floor(ratio * 4), 3)];
  if (ratio >= 1) {
    completed = true;
    navigator.vibrate?.([40, 35, 80]);
    setTimeout(() => show('wish'), 650);
  } else holdFrame = requestAnimationFrame(tickHold);
};
const startHold = event => {
  event.preventDefault();
  if (activeHoldPointer !== null) return;
  activeHoldPointer = event.pointerId;
  hold.setPointerCapture?.(event.pointerId);
  completed = false;
  holdStart = performance.now();
  document.querySelector('#ride').classList.add('racing');
  navigator.vibrate?.(30);
  holdFrame = requestAnimationFrame(tickHold);
};
hold.addEventListener('pointerdown', startHold);
hold.addEventListener('pointerup', stopHold);
hold.addEventListener('pointercancel', stopHold);
hold.addEventListener('contextmenu', event => event.preventDefault());
hold.addEventListener('selectstart', event => event.preventDefault());
hold.addEventListener('dragstart', event => event.preventDefault());

const wish = document.querySelector('#make-wish');
const swipeZone = document.querySelector('#swipe-zone');
let swipeStart = null;
const finishWish = () => {
  document.querySelector('.flame').classList.add('out');
  wish.textContent = '愿望已被风妥善收藏';
  navigator.vibrate?.(50);
  setTimeout(() => show('moments'), 1400);
};
wish.addEventListener('click', finishWish);
document.querySelector('#wish').addEventListener('pointerdown', e => swipeStart = e.clientY);
document.querySelector('#wish').addEventListener('pointerup', e => {
  if (swipeStart !== null && swipeStart - e.clientY > 60) finishWish();
  swipeStart = null;
});

const moments = [
  ['assets/user-scene-01.jpg', '雨后相遇', '有些相遇像雨后的光，来得刚刚好。'],
  ['assets/user-scene-02.jpg', '晴日约定', '今天所有盛大的风景，都只是为你而来。'],
  ['assets/user-scene-03.jpg', '赛道休憩', '赢下比赛不难，难的是忍住不先来见你。'],
  ['assets/user-scene-04.jpg', '秋日露营', '喜欢的风景，要和喜欢的人一起看才算数。'],
  ['assets/user-scene-05.jpg', '极速心跳', '坐稳。下一段路，我们一起加速。'],
  ['assets/user-scene-06.jpg', '雨夜同行', '下雨也没关系，我会走到你这一边。'],
  ['assets/user-scene-07.jpg', '午后小憩', '偶尔慢下来，也是一种值得收藏的浪漫。'],
  ['assets/user-scene-08.jpg', '终点之前', '只要你想，今晚的赛道永远没有终点。']
];
moments.forEach(([src]) => { const image = new Image(); image.decoding = 'async'; image.src = src; });
let momentIndex = 0;
const momentProgress = document.querySelector('#moment-progress');
momentProgress.innerHTML = moments.map((_, i) => `<i class="${i === 0 ? 'active' : ''}"></i>`).join('');
const renderMoment = index => {
  const photo = document.querySelector('#moment-photo');
  photo.src = moments[index][0];
  document.querySelector('#moment-backdrop').src = moments[index][0];
  photo.alt = `萧逸 · ${moments[index][1]}`;
  document.querySelector('#moment-title').textContent = moments[index][1];
  document.querySelector('#moment-line').textContent = moments[index][2];
  document.querySelector('#moment-index').textContent = `CHAPTER ${String(index + 1).padStart(2, '0')} / 08`;
  [...momentProgress.children].forEach((dot, i) => dot.classList.toggle('active', i <= index));
  photo.animate?.([{ opacity: .35, transform: 'scale(1.025)' }, { opacity: 1, transform: 'scale(1.002)' }], { duration: 420, easing: 'ease-out' });
};
const advanceMoment = () => {
  if (momentIndex === moments.length - 1) return show('card');
  momentIndex += 1;
  renderMoment(momentIndex);
};
document.querySelector('#moment-next').addEventListener('click', event => { event.stopPropagation(); advanceMoment(); });
const momentScene = document.querySelector('#moments');
let momentPointerStart = null;
let ignoreMomentClick = false;
momentScene.addEventListener('pointerdown', event => { momentPointerStart = { x: event.clientX, y: event.clientY }; });
momentScene.addEventListener('pointerup', event => {
  if (!momentPointerStart) return;
  const dx = event.clientX - momentPointerStart.x;
  const dy = event.clientY - momentPointerStart.y;
  momentPointerStart = null;
  if (dx < -45 || dy < -55) {
    ignoreMomentClick = true;
    advanceMoment();
    setTimeout(() => ignoreMomentClick = false, 350);
  }
});
momentScene.addEventListener('click', event => {
  if (ignoreMomentClick || event.target.closest('#moment-next')) return;
  advanceMoment();
});

const cards = [
  ['assets/user-scene-09.jpg', '萧逸 · 蓝海祝愿', '“今天的第一块蛋糕，当然要留给寿星。”'],
  ['assets/user-scene-10.jpg', '萧逸 · 风帆奇遇', '“想去更远的地方？抓紧我，清宜。”'],
  ['assets/user-scene-11.jpg', '萧逸 · 凛冬追光', '“路再难走也没关系，我陪你一起闯。”'],
  ['assets/user-scene-12.jpg', '萧逸 · 午后密语', '“新的一岁，也只做让自己开心的事。”']
];
let cardIndex = 0;
const cardElement = document.querySelector('#memory-card');
const cardDots = document.querySelector('#card-dots');
cardDots.innerHTML = cards.map((_, i) => `<i class="${i === 0 ? 'active' : ''}"></i>`).join('');
const renderCard = index => {
  cardElement.classList.remove('flipped');
  document.querySelector('#card-image').src = cards[index][0];
  document.querySelector('#card-name').textContent = cards[index][1];
  document.querySelector('#card-quote').textContent = cards[index][2];
  document.querySelector('.card-meta span').textContent = `生日限定 · ${String(index + 1).padStart(2, '0')} / 04`;
  [...cardDots.children].forEach((dot, i) => dot.classList.toggle('active', i === index));
};
cardElement.addEventListener('click', e => e.currentTarget.classList.toggle('flipped'));
document.querySelector('#card-prev').addEventListener('click', () => { cardIndex = (cardIndex + cards.length - 1) % cards.length; renderCard(cardIndex); });
document.querySelector('#card-next').addEventListener('click', () => { cardIndex = (cardIndex + 1) % cards.length; renderCard(cardIndex); });
document.querySelector('#restart').addEventListener('click', () => {
  dialogueIndex = 0;
  completed = false;
  momentIndex = 0;
  cardIndex = 0;
  renderMoment(0);
  renderCard(0);
  document.querySelector('#dialogue-title').textContent = dialogueLines[0];
  document.querySelector('.flame').classList.remove('out');
  document.querySelector('#memory-card').classList.remove('flipped');
  progress.style.strokeDashoffset = 339.3;
  show('opening');
});

// Handy for visual review: append ?scene=dialogue or ?scene=card.
const previewScene = new URLSearchParams(location.search).get('scene');
if (previewScene && scenes.some(scene => scene.id === previewScene)) show(previewScene);

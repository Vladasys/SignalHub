# SignalHub

**SignalHub** — data & attribution hub for marketing.  
We connect **leads, deals, events, and ad platforms** into one stitched flow.  
From **click to revenue** — full transparency.

## What it does
- Collects signals from multiple ad sources  
- Stitches leads → deals → revenue  
- Builds real attribution models  
- Delivers actionable insights  

## Why SignalHub?
Because pixels lie, but deals don’t.  
SignalHub shows what *really* drives growth.

---

# SignalHub (RU)

**SignalHub** — хаб сигналов для маркетинга.  
Мы соединяем **лиды, сделки, события и рекламные источники** в единую систему атрибуции.  
От **клика до выручки** — полная прозрачность.

## Что умеет
- Собирает сигналы из разных рекламных каналов  
- «Сшивает» лиды → сделки → выручку  
- Строит реальные модели атрибуции  
- Даёт понятные инсайты для роста  

---

🚀 Deployed on [Cloudflare Pages](https://pages.cloudflare.com/)
📊 Engineered for clarity, speed, and scale.

## Development notes

- Все HTML-страницы должны содержать Google Analytics-тег сразу после открытия тега `<head>`:

  ```html
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-9W93MFG4YF"></script>
  <script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-9W93MFG4YF');
  </script>
  ```

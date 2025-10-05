(() => {
  const doc = document;
  const table = doc.getElementById('profileTable');
  if (!table) return;

  const methodTitleEl = doc.getElementById('methodTitle');
  const methodFormulaEl = doc.getElementById('methodFormula');
  const methodTextEl = doc.getElementById('methodText');
  const verdictCard = doc.getElementById('verdictCard');
  const verdictTextEl = doc.getElementById('verdictText');
  const verdictWhisperEl = doc.getElementById('verdictWhisper');
  const refreshBtn = doc.getElementById('aboutRefresh');
  const cardsContainer = doc.getElementById('profileCards');
  const tableBody = table.querySelector('tbody');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  const benchmarks = {
    browsers: {
      Chrome: 62,
      Safari: 20,
      Edge: 5,
      Firefox: 3,
      Samsung: 3,
      Opera: 2,
      'Другие': 5,
    },
    osDesktop: {
      'Windows 10': 22,
      'Windows 11': 16,
      macOS: 9,
      'Linux/др.': 2,
    },
    osMobile: {
      Android: 40,
      iOS: 19,
    },
    device: {
      Desktop: 55,
      Mobile: 43,
      Tablet: 2,
    },
    resolutions: {
      '1920×1080': 27,
      '1366×768': 8,
      '1280×720': 6,
      '360×800': 6,
      '414×896': 4,
      '1536×864': 3,
      'Другие': 46,
    },
    languages: {
      'ru-RU': 45,
      'en-US': 30,
      'ro-RO': 8,
      'de-DE': 5,
      'fr-FR': 4,
      'Другие': 8,
    },
  };

  const parameterMeta = {
    browser: {
      label: 'Браузер',
      description: 'Какой браузер сейчас открывает страницу. Чаще всего это Chrome, но иногда встречаются сюрпризы.',
      category: 'browsers',
    },
    os: {
      label: 'ОС',
      description: 'Операционная система устройства. Помогает понять, с каким окружением обычно приходит трафик.',
    },
    device: {
      label: 'Устройство',
      description: 'Тип устройства: десктоп, мобильное или планшет. Заодно показывает, насколько экран дружелюбен к аналитике.',
      category: 'device',
    },
    resolution: {
      label: 'Разрешение',
      description: 'Размер текущего viewport. Показывает, насколько широкий экран и в какую группу он попадает.',
      category: 'resolutions',
    },
    language: {
      label: 'Язык',
      description: 'Базовый языковой код браузера. Даёт подсказку, на каком языке стоит говорить с пользователем.',
      category: 'languages',
    },
  };

  const methodVariants = [
    {
      title: 'Метод: эмпирический',
      formula: 'p = freq(точной комбинации)/N',
      text: 'Берём частоту точной комбинации параметров за окно наблюдения и считаем вероятность. Если комбинации нет — считаем её редкой, но не уникальной, с минимальной ненулевой оценкой.',
    },
    {
      title: 'Метод: независимая оценка',
      formula: 'p = Π P(param=value)',
      text: 'Складываемся из простых долей по каждому параметру и перемножаем. Работает быстро, иногда наивно — зато честно и прозрачно.',
    },
    {
      title: 'Метод: сглаженный',
      formula: 'p = (count(combo)+α)/(N+α·K)',
      text: 'Добавляем сглаживание Лапласа, чтобы редкие комбинации не становились нулями. Маленькая приправа α делает мир стабильнее.',
    },
  ];

  const verdictTemplates = [
    (state) => `Ваш профиль встречается у ~${state.formattedOccurrence}. Уникальность ${state.formattedUniqueness}. Практически единорог — только без рога и с ${state.browserPhrase}.`,
    (state) => {
      const percentInfo = state.formattedOccurrence ? ` (~${state.formattedOccurrence})` : '';
      return `Вероятность встретить такого же — примерно 1 из ${state.formattedOneIn || '∞'}${percentInfo}. Повезло же статистике — вы ей понравились.`;
    },
    (state) => `Ваш профиль встречается у ~${state.formattedOccurrence}. Уникальность ${state.formattedUniqueness}. Да-да, почти как все — только лучше. Папка «Особенные» уже создана.`,
  ];

  const formatPercent = (value) => {
    if (typeof value !== 'number' || Number.isNaN(value)) return '—';
    const abs = Math.abs(value);
    const options = abs >= 10
      ? { maximumFractionDigits: 0 }
      : abs >= 1
        ? { minimumFractionDigits: 1, maximumFractionDigits: 1 }
        : { minimumFractionDigits: 2, maximumFractionDigits: 2 };
    return `${new Intl.NumberFormat('ru-RU', options).format(value)}%`;
  };

  const formatShareValue = (value) => {
    if (typeof value !== 'number' || Number.isNaN(value)) return '—';
    const abs = Math.abs(value);
    const options = abs >= 1
      ? { maximumFractionDigits: 0 }
      : { minimumFractionDigits: 2, maximumFractionDigits: 2 };
    return `${new Intl.NumberFormat('ru-RU', options).format(value)}%`;
  };

  const detectDeviceType = () => {
    const ua = navigator.userAgent || '';
    const uaData = navigator.userAgentData;
    const isTabletUA = /(iPad|Tablet|PlayBook|Silk|Kindle|SM-T|SM-P|Tab|Nexus 7|Nexus 9|Nexus 10|Pixel C|Xoom|Lenovo Tab)/i.test(ua);
    const isModernIPad = /Macintosh/i.test(ua) && navigator.maxTouchPoints > 1;
    if (isTabletUA || isModernIPad) return { value: 'Tablet', benchKey: 'Tablet' };
    const isMobile = (uaData && uaData.mobile) || /Mobile|iPhone|Android/i.test(ua);
    if (isMobile) return { value: 'Mobile', benchKey: 'Mobile' };
    return { value: 'Desktop', benchKey: 'Desktop' };
  };

  const detectBrowser = () => {
    const ua = navigator.userAgent || '';
    const brands = navigator.userAgentData?.brands?.map((item) => item.brand.toLowerCase()) || [];
    const source = `${ua} ${brands.join(' ')}`;
    if (/edg/i.test(source)) return { value: 'Edge', benchKey: 'Edge' };
    if (/opr|opera/i.test(source)) return { value: 'Opera', benchKey: 'Opera' };
    if (/samsungbrowser/i.test(source)) return { value: 'Samsung Internet', benchKey: 'Samsung', shareNote: 'По группе «Samsung»' };
    if (/firefox|fxios/i.test(source)) return { value: 'Firefox', benchKey: 'Firefox' };
    if (/YaBrowser/i.test(source)) return { value: 'Yandex Browser', benchKey: 'Другие', shareNote: 'По группе «Другие»' };
    if (/OPiOS/i.test(source)) return { value: 'Opera', benchKey: 'Opera' };
    if (/CriOS|Chrome|Chromium/i.test(source)) return { value: 'Chrome', benchKey: 'Chrome' };
    if (/safari/i.test(source) && !/chrome|crios|chromium|android|edge|opr/i.test(source)) {
      return { value: 'Safari', benchKey: 'Safari' };
    }
    return { value: navigator.userAgentData?.brands?.[0]?.brand || 'Другие', benchKey: 'Другие', shareNote: 'По группе «Другие»' };
  };

  const detectLanguage = () => {
    const language = (navigator.languages && navigator.languages[0]) || navigator.language || '';
    if (!language) return { value: null, benchKey: null, missing: true };
    const normalized = language.trim();
    const benchKey = Object.prototype.hasOwnProperty.call(benchmarks.languages, normalized) ? normalized : 'Другие';
    const shareNote = benchKey === 'Другие' ? 'По группе «Другие»' : '';
    return { value: normalized, benchKey, shareNote };
  };

  const detectResolution = () => {
    const width = Math.round(window.innerWidth || doc.documentElement.clientWidth || screen.width || 0);
    const height = Math.round(window.innerHeight || doc.documentElement.clientHeight || screen.height || 0);
    if (!width || !height) {
      return { value: null, benchKey: null, missing: true };
    }
    const actual = `${width}×${height}`;
    const resolutionEntries = Object.entries(benchmarks.resolutions)
      .filter(([label]) => label !== 'Другие')
      .map(([label, share]) => {
        const [w, h] = label.split('×').map(Number);
        return { label, share, width: w, height: h };
      });
    const directMatch = resolutionEntries.find((item) => (
      (item.width === width && item.height === height) ||
      (item.width === height && item.height === width)
    ));
    if (directMatch) {
      return { value: actual, benchKey: directMatch.label };
    }
    let bestMatch = null;
    let bestDiff = Number.POSITIVE_INFINITY;
    resolutionEntries.forEach((item) => {
      const diffA = Math.abs(width - item.width) + Math.abs(height - item.height);
      const diffB = Math.abs(width - item.height) + Math.abs(height - item.width);
      const diff = Math.min(diffA, diffB);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestMatch = item;
      }
    });
    if (bestMatch && bestDiff / Math.max(width, height) <= 0.25) {
      return {
        value: actual,
        benchKey: bestMatch.label,
        shareNote: `≈ группа ${bestMatch.label}`,
      };
    }
    return { value: actual, benchKey: 'Другие', shareNote: 'По группе «Другие»' };
  };

  const detectOS = async (deviceType) => {
    const ua = navigator.userAgent || '';
    const data = navigator.userAgentData;
    let platform = data?.platform || '';
    let platformVersion = '';
    if (data?.getHighEntropyValues) {
      try {
        const entropy = await data.getHighEntropyValues(['platform', 'platformVersion']);
        platform = entropy.platform || platform;
        platformVersion = entropy.platformVersion || '';
      } catch (error) {
        /* ignore */
      }
    }
    if (deviceType === 'Desktop') {
      if (/Windows/i.test(platform) || /Windows/i.test(ua)) {
        const major = parseInt(platformVersion.split('.')[0], 10);
        if (Number.isFinite(major)) {
          return { value: major >= 15 ? 'Windows 11' : 'Windows 10', benchKey: major >= 15 ? 'Windows 11' : 'Windows 10' };
        }
        return { value: 'Windows 10', benchKey: 'Windows 10' };
      }
      if (/Mac|macOS/i.test(platform) || /Macintosh|Mac OS X/i.test(ua)) {
        return { value: 'macOS', benchKey: 'macOS' };
      }
      if (/Linux|X11|Ubuntu|Fedora|Debian/i.test(platform) || /Linux|X11|Ubuntu|Fedora|Debian/i.test(ua)) {
        return { value: 'Linux/др.', benchKey: 'Linux/др.' };
      }
    } else {
      if (/Android/i.test(ua)) {
        return { value: 'Android', benchKey: 'Android' };
      }
      if (/iPhone|iPad|iPod/i.test(ua) || ((/Macintosh/i.test(ua) || /macOS/i.test(platform)) && navigator.maxTouchPoints > 1)) {
        return { value: 'iOS', benchKey: 'iOS' };
      }
    }
    return { value: null, benchKey: null, missing: true };
  };

  const resolveShare = (category, key) => {
    if (!category) return null;
    const tableData = benchmarks[category];
    if (!tableData) return null;
    if (key && Object.prototype.hasOwnProperty.call(tableData, key)) {
      return { share: tableData[key], benchKey: key };
    }
    if (Object.prototype.hasOwnProperty.call(tableData, 'Другие')) {
      return { share: tableData['Другие'], benchKey: 'Другие' };
    }
    return null;
  };

  const buildRow = (key, detection, categoryOverride) => {
    const meta = parameterMeta[key];
    const row = {
      key,
      label: meta.label,
      description: meta.description,
      value: '—',
      valueNote: '',
      share: null,
      shareLabel: '—',
      shareNote: '',
      benchLabel: null,
      missing: true,
    };

    if (!detection || detection.value == null) {
      row.value = '—';
      row.valueNote = 'Пока не удалось определить.';
      return row;
    }

    row.value = detection.value;
    row.missing = false;
    if (detection.valueNote) row.valueNote = detection.valueNote;
    const category = categoryOverride || meta.category;
    const shareInfo = resolveShare(category, detection.benchKey);
    if (shareInfo) {
      row.share = shareInfo.share;
    row.shareLabel = formatShareValue(shareInfo.share);
      row.benchLabel = shareInfo.benchKey;
      if (shareInfo.benchKey === 'Другие' && !detection.shareNote) {
        row.shareNote = 'По группе «Другие»';
      }
    }
    if (detection.shareNote) row.shareNote = detection.shareNote;
    if (!shareInfo) row.shareLabel = '—';
    if (!detection.valueNote) row.valueNote = '';
    return row;
  };

  const renderProfile = (rows) => {
    tableBody.innerHTML = '';
    if (cardsContainer) cardsContainer.innerHTML = '';
    rows.forEach((row) => {
      const tr = doc.createElement('tr');
      const th = doc.createElement('th');
      th.scope = 'row';
      th.textContent = row.label;
      tr.appendChild(th);

      const valueTd = doc.createElement('td');
      const valueMain = doc.createElement('span');
      valueMain.className = 'profile-value';
      valueMain.textContent = row.value;
      valueTd.appendChild(valueMain);
      if (row.valueNote) {
        const note = doc.createElement('span');
        note.className = 'profile-value-note';
        note.textContent = row.valueNote;
        valueTd.appendChild(note);
      }
      tr.appendChild(valueTd);

      const shareTd = doc.createElement('td');
      const shareMain = doc.createElement('span');
      shareMain.className = 'profile-share';
      shareMain.textContent = row.shareLabel;
      shareTd.appendChild(shareMain);
      if (row.shareNote) {
        const note = doc.createElement('span');
        note.className = 'profile-share-note';
        note.textContent = row.shareNote;
        shareTd.appendChild(note);
      }
      tr.appendChild(shareTd);
      tableBody.appendChild(tr);

      if (cardsContainer) {
        const card = doc.createElement('details');
        card.className = 'profile-card';
        const summary = doc.createElement('summary');
        const head = doc.createElement('div');
        head.className = 'card-top';
        const label = doc.createElement('span');
        label.className = 'card-label';
        label.textContent = row.label;
        const share = doc.createElement('span');
        share.className = 'card-share';
        share.textContent = row.shareLabel;
        head.appendChild(label);
        head.appendChild(share);
        summary.appendChild(head);
        const value = doc.createElement('div');
        value.className = 'card-value';
        value.textContent = row.value;
        summary.appendChild(value);
        card.appendChild(summary);
        const body = doc.createElement('div');
        body.className = 'card-body';
        const desc = doc.createElement('p');
        desc.textContent = row.description;
        body.appendChild(desc);
        if (row.valueNote) {
          const note = doc.createElement('p');
          note.className = 'card-note';
          note.textContent = row.valueNote;
          body.appendChild(note);
        }
        if (row.shareNote) {
          const note = doc.createElement('p');
          note.className = 'card-note';
          note.textContent = row.shareNote;
          body.appendChild(note);
        }
        if (row.missing || typeof row.share !== 'number') {
          const note = doc.createElement('p');
          note.className = 'card-note';
          note.textContent = 'Пока не удалось посчитать этот параметр — не переживайте, скоро догоню.';
          body.appendChild(note);
        }
        card.appendChild(body);
        cardsContainer.appendChild(card);
      }
    });
  };

  const animateVerdict = () => {
    if (!verdictCard || prefersReduced.matches) return;
    verdictCard.classList.remove('is-animated');
    void verdictCard.offsetWidth;
    verdictCard.classList.add('is-animated');
  };

  const renderMethod = (state) => {
    const variant = methodVariants[Math.floor(Math.random() * methodVariants.length)];
    if (methodTitleEl) methodTitleEl.textContent = variant.title;
    if (methodFormulaEl) methodFormulaEl.textContent = variant.formula;
    if (methodTextEl) {
      methodTextEl.textContent = variant.text;
      const missing = state.missingLabels;
      if (missing.length) {
        missing.forEach((label) => {
          const note = doc.createElement('span');
          note.className = 'method-note';
          note.textContent = `Параметр ${label} временно исключён из расчёта.`;
          methodTextEl.appendChild(note);
        });
      }
    }
  };

  const renderVerdict = (state) => {
    const template = verdictTemplates[Math.floor(Math.random() * verdictTemplates.length)];
    if (verdictTextEl) verdictTextEl.textContent = template(state);
    if (verdictWhisperEl) {
      if (state.missingLabels.length) {
        const list = state.missingLabels.join(', ');
        verdictWhisperEl.textContent = `Параметр ${list} сегодня ускользнул от замера. Ничего, догоню в следующий раз.`;
        verdictWhisperEl.hidden = false;
      } else {
        verdictWhisperEl.hidden = true;
        verdictWhisperEl.textContent = '';
      }
    }
    animateVerdict();
  };

  const init = async () => {
    const device = detectDeviceType();
    const browser = detectBrowser();
    const resolution = detectResolution();
    const language = detectLanguage();
    const os = await detectOS(device.benchKey);
    const rows = [
      buildRow('browser', browser, 'browsers'),
      buildRow('os', os, device.value === 'Desktop' ? 'osDesktop' : 'osMobile'),
      buildRow('device', device, 'device'),
      buildRow('resolution', resolution, 'resolutions'),
      buildRow('language', language, 'languages'),
    ];
    renderProfile(rows);

    const validRows = rows.filter((row) => !row.missing && typeof row.share === 'number');
    const probability = validRows.reduce((acc, row) => acc * (row.share / 100), validRows.length ? 1 : 0);
    const occurrence = probability * 100;
    const uniqueness = Math.max(0, 100 - occurrence);
    const browserRow = rows.find((row) => row.key === 'browser');
    const browserValue = browserRow?.value || '';
    let browserPhrase = 'браузером';
    if (browserValue && browserValue !== '—') {
      browserPhrase = browserValue === 'Другие' ? 'браузером из категории «Другие»' : browserValue;
    }

    const state = {
      rows,
      probability,
      occurrence,
      uniqueness,
      formattedOccurrence: formatPercent(occurrence),
      formattedUniqueness: formatPercent(uniqueness),
      formattedOneIn: probability > 0 ? new Intl.NumberFormat('ru-RU').format(Math.round(1 / probability)) : null,
      missingLabels: rows.filter((row) => row.missing || typeof row.share !== 'number').map((row) => row.label),
      browserValue,
      browserPhrase,
    };

    renderMethod(state);
    renderVerdict(state);
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        renderMethod(state);
        renderVerdict(state);
      });
    }
  };

  init();
})();

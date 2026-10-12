# Национальный Футбольный Менеджер

Браузерный менеджер национальной сборной (по мотивам жанра True Football National Manager). Полностью на русском, оригинальный код, все имена игроков и клубов вымышлены. Статический сайт (HTML/CSS/JS), без сборки.

**Играть:** https://danyadanileckiy.github.io/national-football-manager/

## Возможности
- 210 сборных из 6 конфедераций, рейтинг силы (звёзды), Эло-рейтинг, SVG-флаги (flag-icons, MIT)
- Четырёхлетний цикл с реальными датами окон (март/июнь/сентябрь/октябрь/ноябрь): Лиги наций УЕФА и КОНКАКАФ, отборы ЧЕ, Кубков Африки и Азии, отборы ЧМ по конфедерациям, Евро, Копа Америка, Кубок Азии, Кубок Африки, Золотой кубок, Кубок наций ОФК, ЧМ на 48 команд (12 групп + 1/16)
- Реалистичные форматы (v3): двухматчевые раунды по сумме (без правила выездного гола, д.в. и пенальти), стыки УЕФА (пути) к ЧМ и Евро, межконтинентальные стыки (6 команд, 2 путёвки), многоэтапные отборы АФК/КОНКАКАФ/ОФК, единая лига КОНМЕБОЛ на 18 туров, стыки КАФ; Лиги наций УЕФА (A–D) и КОНКАКАФ (A–C) с повышением/вылетом между розыгрышами, 1/4 финала, «Финал четырёх» и стыками за место в лиге
- Вымышленные имена в латинице по языковым группам (уникальные фамилии в составе), клубы по уровню лиг, рост, рабочая нога, история матчей/голов на старте
- Матч: преимущество своего поля зависит от заполняемости стадиона, нейтральные поля на турнирах, погода, добавленное время, VAR, голы со штрафных и пенальти, накопление усталости в окне
- Рейтинг ФИФА по формуле SUM (ежемесячные снимки, стрелки, график), корзины всех жеребьёвок по рейтингу; анимированная жеребьёвка с ограничениями по конфедерациям
- Молодёжные и прочие турниры (v4): ЧМ U-17 (ежегодно, 48 команд) с отборами, континентальные первенства U-19/U-20 и ЧМ U-20, молодёжный Евро U-21 с отбором, олимпийские отборы U-23 и Олимпийский турнир (U-23 + 3 старше), Кубок чемпионов континентов, Кубок арабских наций, Кубок Персидского залива, чемпионат Юго-Восточной Азии, Чемпионат африканских наций (местные лиги), Кубок Восточной Азии, чемпионат Южной Азии, Королевский кубок
- Клубная жизнь между окнами (форма, голы, травмы, трансферы), давление прессы и настроение болельщиков, двойное гражданство и натурализация
- Все матчи мира симулируются тем же движком — таблицы, бомбардиры, сетки живые
- Пул игроков: позиции, возраст, клуб, 7 навыков, форма, мораль, свежесть, потенциал, характер; травмы, карточки и дисквалификации, старение, завершение карьеры, воспитанники академии, скаутинг игроков с двойным гражданством
- Вызов 18–23, схема и состав drag/tap на поле, командные и индивидуальные установки
- Поминутный движок: владение, удары, xG, фолы, угловые, карточки, травмы, 2D-поле с мячом, комментарии, пауза/скорость, замены и тактика по ходу, доп. время и пенальти, оценки игроков
- Пресс-конференции, разговоры с игроками, доверие федерации, увольнение и предложения от других сборных, инфраструктура, тренировки, U-21
- Статистика: история оценок игрока (график), сухие матчи, голы/передачи, история матчей с деталями, бомбардиры по турнирам, рекорды, рейтинг, трофеи и достижения
- 3 слота сохранений в localStorage (LZW-сжатие) + экспорт/импорт файла

## Тест
`node test/sim.js 8 FR` — headless-симуляция двух циклов (≈7000 матчей), проверка результативности и силы фаворитов. `node test/calib.js` — калибровка движка. `node test/fmt.js` — проверка форматов цикла (нет двух матчей в день у команды, 48 участников ЧМ, перемещения в Лигах наций).

Сохранения версии 3 автоматически обновляются до версии 4; сохранения версии 2 и старше несовместимы — игра сообщает об этом и предлагает начать заново.

## Update 5: design & languages
- New design system (css/style.css, Inter + Oswald fonts, OFL licence), Lucide icons (ISC licence), kit colours worked out from each nation's flag (js/kits.js), and original SVG badges and trophies (js/gfx.js). Bottom nav bar on phones, sidebar on desktop, broadcast-style match screen with a momentum graph and timeline, toast notifications.
- i18n: `_t("Russian source", …)` with hashed keys. There are 20 languages (ru en es pt de fr it pl uk he ar tr ja zh ko nl cs id hi fa), with RTL for he/ar/fa. Country names come from Intl.DisplayNames.
  Source files are in `i18n/src/<lang>.txt` (format `index|text`, indexed by `i18n/master.txt`). Build with `node tools/build-i18n.js`; check with `node test/i18n.js`.

## Update 6: depth, economy, hosting, themes
- Stats: per-shot map with xG, player heatmaps (last match), pass accuracy, tackles, interceptions, duels; goals − xG, 1v1 and penalty conversion; GK save %, penalties saved, xGA − conceded; last-5 ratings in the call-up list; two-player radar comparison; head-to-head vs every nation; team records; results by formation; coach stats per tournament and per 4-year cycle; Hall of Fame.
- History: real winners (countries only) of major tournaments before 2026, a generated archive for the rest, generated 1993–2025 ranking history, and fictional past legends and records (clearly marked as generated).
- Saves: 20 manual slots plus a separate autosave. Saves go to IndexedDB with gzip compression and are written asynchronously.
- Performance: calendar simulation runs in small chunks with a loading overlay, so the UI doesn't freeze.
- FIFA ranking: monthly movers, biggest climbers and fallers, team history chart, points gained or lost per match, confederation filter, top-10 timeline.
- Economy and stadiums: sponsors, TV, tickets, prize money and merchandise against staff, facility and stadium costs. You can build or expand stadiums in different cities; the main stadium affects attendance, home advantage and hosting bids.
- Training: focus per line or per player (attack, defence, set pieces, fitness, tactics familiarity, GK, rest), intensity vs injury risk, staff quality, and an Auto mode.
- Hosting bids: you can bid only in your own confederation. The World Cup uses a rotation rule. AI rivals bid too, there is a vote with mail results, an optional co-host, and the host qualifies automatically.
- Optional cheats (enable in Settings): the save is marked as a cheat save and achievements stop counting.
- 5 themes: Stadium Night, Classic Pitch, Midnight Blue, Light, Sand/Retro.

## Обновление 7
- Товарищеские матчи с переговорами: соперник, дом/выезд/нейтральный город, гонорар (сила, рейтинг ФИФА, привлекательность, посещаемость), принять/отказаться/встречное предложение (до 3 раундов).
- Тренировочные сборы: место и климат, 5/10/14 дней, стоимость; +сыгранность и готовность, небольшой риск травм; полный эффект — перед финальным турниром.
- Новости: «Мировые итоги» после каждого окна — 15 важнейших матчей других сборных (стадия, рейтинг, сенсации) со счётом и авторами голов; новости клубов.
- Жеребьёвки: корзины по рейтингу ФИФА; ограничение конфедераций во всех межконфедерационных турнирах (ЧМ, Олимпиада, юношеские ЧМ); межконтинентальные стыки — без пар одной конфедерации в 1-м раунде; правило показывается на экране жеребьёвки. Проверка: `node test/draw.js`.
- Экипировка: контракты с техническим спонсором (сумма, срок, бонусы за трофей и выход на турнир), дизайнер домашней/гостевой формы (узоры, цвета флага, SVG), ажиотаж влияет на мерчендайз.
- Мировая статистика: бомбардиры (цикл/всё время), голы команд, рекорды и серии, сила команд со снимками каждый месяц: изменения за месяц/3 месяца/год, лидеры роста и падения, график по команде, сортируемая таблица с фильтром конфедераций.

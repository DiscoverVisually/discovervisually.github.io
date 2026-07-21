import { r as e } from "./rolldown-runtime-S-ySWqyJ.js";
import { i as t, r as n } from "./framework-DjPHiq1u.js";
var r = e(t(), 1),
  i = n(),
  a = [
    {
      number: `01`,
      name: `Christian`,
      promise: `Faith explored through art, history and human stories.`,
      className: `portal-christian`,
    },
    {
      number: `02`,
      name: `For Children`,
      promise: `Big worlds for curious young readers to step inside.`,
      className: `portal-children`,
    },
    {
      number: `03`,
      name: `For Women`,
      promise: `Beautiful books for reflection, courage and connection.`,
      className: `portal-women`,
    },
    {
      number: `04`,
      name: `Educational`,
      promise: `Knowledge made vivid, memorable and impossible to skim past.`,
      className: `portal-educational`,
    },
  ],
  o = [
    {
      title: `Pompeii: The Last Day`,
      eyebrow: `History Hunters · Ages 8+`,
      hook: `Witness the last 24 hours through maps, science and cinematic visual history.`,
      cover: `cover-pompeii`,
      image: `/books/pompeii-cover.webp`,
      alt: `Pompeii: The Last Day book cover`,
      number: `01 / 03`,
      href: `/books/pompeii-the-last-day.html`,
    },
    {
      title: `Women of the Bible for Today`,
      eyebrow: `Visual Bible study · For women`,
      hook: `Meet the women of Scripture through a richly visual study created for modern life.`,
      cover: `cover-women`,
      image: `/books/women-of-the-bible.webp`,
      alt: `Women of the Bible for Today book cover`,
      number: `02 / 03`,
      href: `/books/women-of-the-bible-for-today.html`,
    },
    {
      title: `The Ultimate Romantasy Yearbook`,
      eyebrow: `Romantasy · 2005–2026 edition`,
      hook: `A visual guide to fantasy romance’s biggest books, tropes and reader obsessions.`,
      cover: `cover-romantasy`,
      image: `/books/romantasy-yearbook.webp`,
      alt: `The Ultimate Romantasy Yearbook book cover`,
      number: `03 / 03`,
      href: `/books/the-ultimate-romantasy-yearbook.html`,
    },
  ];
function s() {
  let e = (0, r.useRef)(null),
    [t, n] = (0, r.useState)(!1),
    [s, c] = (0, r.useState)(!1);
  return (
    (0, r.useEffect)(() => {
      let t = 0,
        n = () => {
          let n = window.scrollY;
          document.documentElement.style.setProperty(`--page-y`, `${n}px`);
          let r = e.current;
          if (r) {
            let e = r.getBoundingClientRect(),
              t = Math.max(1, r.offsetHeight - window.innerHeight),
              n = Math.min(1, Math.max(0, -e.top / t));
            r.style.setProperty(`--open`, n.toFixed(3));
          }
          t = 0;
        },
        r = () => {
          t ||= requestAnimationFrame(n);
        };
      return (
        n(),
        window.addEventListener(`scroll`, r, { passive: !0 }),
        window.addEventListener(`resize`, r),
        () => {
          (window.removeEventListener(`scroll`, r),
            window.removeEventListener(`resize`, r),
            t && cancelAnimationFrame(t));
        }
      );
    }, []),
    (0, i.jsxs)(`main`, {
      children: [
        (0, i.jsxs)(`header`, {
          className: `site-header`,
          children: [
            (0, i.jsxs)(`a`, {
              href: `#top`,
              className: `brand`,
              "aria-label": `Discover Visually home`,
              children: [
                (0, i.jsxs)(`span`, {
                  className: `brand-mark`,
                  "aria-hidden": `true`,
                  children: [(0, i.jsx)(`i`, {}), (0, i.jsx)(`i`, {})],
                }),
                (0, i.jsxs)(`span`, {
                  children: [
                    `Discover `,
                    (0, i.jsx)(`b`, { children: `Visually` }),
                  ],
                }),
              ],
            }),
            (0, i.jsxs)(`button`, {
              className: `menu-button`,
              "aria-expanded": t,
              "aria-controls": `primary-nav`,
              onClick: () => n(!t),
              children: [
                (0, i.jsx)(`span`, {}),
                (0, i.jsx)(`span`, {}),
                (0, i.jsx)(`span`, {
                  className: `sr-only`,
                  children: `Toggle navigation`,
                }),
              ],
            }),
            (0, i.jsxs)(`nav`, {
              id: `primary-nav`,
              className: t ? `nav-open` : ``,
              "aria-label": `Primary navigation`,
              children: [
                (0, i.jsx)(`a`, {
                  href: `#worlds`,
                  onClick: () => n(!1),
                  children: `Collections`,
                }),
                (0, i.jsx)(`a`, {
                  href: `#featured`,
                  onClick: () => n(!1),
                  children: `Books`,
                }),
                (0, i.jsx)(`a`, {
                  href: `#manifesto`,
                  onClick: () => n(!1),
                  children: `Our story`,
                }),
                (0, i.jsxs)(`a`, {
                  href: `#newsletter`,
                  className: `nav-cta`,
                  onClick: () => n(!1),
                  children: [
                    `Find a book `,
                    (0, i.jsx)(`span`, { children: `↗` }),
                  ],
                }),
              ],
            }),
          ],
        }),
        (0, i.jsxs)(`section`, {
          id: `top`,
          className: `hero`,
          onPointerMove: (e) => {
            let t = e.clientX / window.innerWidth - 0.5,
              n = e.clientY / window.innerHeight - 0.5;
            (e.currentTarget.style.setProperty(`--mx`, t.toFixed(3)),
              e.currentTarget.style.setProperty(`--my`, n.toFixed(3)));
          },
          children: [
            (0, i.jsx)(`div`, { className: `hero-art hero-art-back` }),
            (0, i.jsx)(`div`, { className: `hero-art hero-art-front` }),
            (0, i.jsx)(`div`, { className: `hero-orbit orbit-one` }),
            (0, i.jsx)(`div`, { className: `hero-orbit orbit-two` }),
            (0, i.jsxs)(`div`, {
              className: `hero-copy`,
              children: [
                (0, i.jsxs)(`p`, {
                  className: `kicker`,
                  children: [
                    (0, i.jsx)(`span`, {}),
                    ` An independent visual publishing house`,
                  ],
                }),
                (0, i.jsxs)(`h1`, {
                  children: [
                    `Stories you don’t just read. `,
                    (0, i.jsx)(`em`, { children: `You enter.` }),
                  ],
                }),
                (0, i.jsx)(`p`, {
                  className: `hero-intro`,
                  children: `Visually immersive books for curious young readers, women, families and lifelong explorers.`,
                }),
                (0, i.jsxs)(`div`, {
                  className: `hero-actions`,
                  children: [
                    (0, i.jsxs)(`a`, {
                      className: `button button-light`,
                      href: `#worlds`,
                      children: [
                        `Explore the catalogue `,
                        (0, i.jsx)(`span`, { children: `↘` }),
                      ],
                    }),
                    (0, i.jsxs)(`a`, {
                      className: `text-link`,
                      href: `#newsletter`,
                      children: [
                        `Find a book for someone `,
                        (0, i.jsx)(`span`, { children: `→` }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            (0, i.jsxs)(`div`, {
              className: `hero-books`,
              "aria-label": `Featured books`,
              children: [
                (0, i.jsx)(`a`, {
                  className: `float-book float-book-one cover-pompeii`,
                  href: `/books/pompeii-the-last-day.html`,
                  "aria-label": `Explore Pompeii: The Last Day`,
                  children: (0, i.jsx)(`img`, {
                    src: `/books/pompeii-cover.webp`,
                    alt: `Pompeii: The Last Day book cover`,
                  }),
                }),
                (0, i.jsx)(`a`, {
                  className: `float-book float-book-two cover-women`,
                  href: `/books/women-of-the-bible-for-today.html`,
                  "aria-label": `Explore Women of the Bible for Today`,
                  children: (0, i.jsx)(`img`, {
                    src: `/books/women-of-the-bible.webp`,
                    alt: `Women of the Bible for Today book cover`,
                  }),
                }),
                (0, i.jsx)(`a`, {
                  className: `float-book float-book-three cover-romantasy`,
                  href: `/books/the-ultimate-romantasy-yearbook.html`,
                  "aria-label": `Explore The Ultimate Romantasy Yearbook`,
                  children: (0, i.jsx)(`img`, {
                    src: `/books/romantasy-yearbook.webp`,
                    alt: `The Ultimate Romantasy Yearbook book cover`,
                  }),
                }),
              ],
            }),
            (0, i.jsxs)(`div`, {
              className: `scroll-cue`,
              children: [
                (0, i.jsx)(`span`, { children: `Scroll to discover` }),
                (0, i.jsx)(`i`, {}),
              ],
            }),
          ],
        }),
        (0, i.jsxs)(`section`, {
          id: `worlds`,
          className: `worlds section-pad`,
          children: [
            (0, i.jsxs)(`div`, {
              className: `section-heading`,
              children: [
                (0, i.jsx)(`p`, {
                  className: `eyebrow`,
                  children: `Choose a world`,
                }),
                (0, i.jsxs)(`h2`, {
                  children: [
                    `There is more than one way`,
                    (0, i.jsx)(`br`, {}),
                    `to `,
                    (0, i.jsx)(`em`, { children: `see a story.` }),
                  ],
                }),
                (0, i.jsx)(`p`, {
                  children: `Browse by the reader, the curiosity or the moment you are choosing for.`,
                }),
              ],
            }),
            (0, i.jsx)(`div`, {
              className: `portal-grid`,
              children: a.map((e) =>
                (0, i.jsxs)(
                  `a`,
                  {
                    href: `#featured`,
                    className: `portal ${e.className}`,
                    children: [
                      (0, i.jsx)(`div`, { className: `portal-image` }),
                      (0, i.jsx)(`span`, {
                        className: `portal-number`,
                        children: e.number,
                      }),
                      (0, i.jsxs)(`div`, {
                        className: `portal-copy`,
                        children: [
                          (0, i.jsx)(`h3`, { children: e.name }),
                          (0, i.jsx)(`p`, { children: e.promise }),
                        ],
                      }),
                      (0, i.jsxs)(`span`, {
                        className: `portal-open`,
                        children: [
                          `Explore `,
                          (0, i.jsx)(`b`, { children: `↗` }),
                        ],
                      }),
                    ],
                  },
                  e.name,
                ),
              ),
            }),
          ],
        }),
        (0, i.jsx)(`section`, {
          ref: e,
          className: `book-story`,
          children: (0, i.jsxs)(`div`, {
            className: `book-sticky`,
            children: [
              (0, i.jsxs)(`div`, {
                className: `book-story-copy copy-left`,
                children: [
                  (0, i.jsx)(`span`, { children: `More than decoration` }),
                  (0, i.jsxs)(`h3`, {
                    children: [
                      `Made to be`,
                      (0, i.jsx)(`br`, {}),
                      `looked into.`,
                    ],
                  }),
                ],
              }),
              (0, i.jsxs)(`div`, {
                className: `opening-book`,
                "aria-label": `An illustrated book opening as you scroll`,
                children: [
                  (0, i.jsx)(`div`, { className: `book-shadow` }),
                  (0, i.jsxs)(`div`, {
                    className: `book-page page-left`,
                    children: [
                      (0, i.jsx)(`span`, {
                        className: `page-label`,
                        children: `Discover`,
                      }),
                      (0, i.jsx)(`div`, { className: `page-sun` }),
                      (0, i.jsx)(`div`, { className: `page-city` }),
                    ],
                  }),
                  (0, i.jsxs)(`div`, {
                    className: `book-page page-right`,
                    children: [
                      (0, i.jsx)(`span`, {
                        className: `page-label`,
                        children: `Visually`,
                      }),
                      (0, i.jsx)(`div`, { className: `page-map` }),
                      (0, i.jsx)(`p`, {
                        children: `Every spread is designed as a place to pause, notice and wonder.`,
                      }),
                    ],
                  }),
                  (0, i.jsxs)(`div`, {
                    className: `book-cover`,
                    children: [
                      (0, i.jsx)(`small`, { children: `DISCOVER VISUALLY` }),
                      (0, i.jsxs)(`b`, {
                        children: [
                          `OPEN`,
                          (0, i.jsx)(`br`, {}),
                          `A NEW`,
                          (0, i.jsx)(`br`, {}),
                          `WORLD`,
                        ],
                      }),
                      (0, i.jsx)(`i`, { children: `VISUAL BOOKS TO EXPLORE` }),
                    ],
                  }),
                ],
              }),
              (0, i.jsxs)(`div`, {
                className: `book-story-copy copy-right`,
                children: [
                  (0, i.jsx)(`span`, { children: `Designed with purpose` }),
                  (0, i.jsxs)(`ul`, {
                    children: [
                      (0, i.jsx)(`li`, { children: `Richly visual` }),
                      (0, i.jsx)(`li`, { children: `Meaningful storytelling` }),
                      (0, i.jsx)(`li`, { children: `Beautiful to give` }),
                    ],
                  }),
                  (0, i.jsxs)(`a`, {
                    href: `#featured`,
                    children: [
                      `Look inside our books `,
                      (0, i.jsx)(`b`, { children: `↗` }),
                    ],
                  }),
                ],
              }),
              (0, i.jsx)(`div`, {
                className: `story-progress`,
                children: (0, i.jsx)(`i`, {}),
              }),
            ],
          }),
        }),
        (0, i.jsxs)(`section`, {
          id: `featured`,
          className: `featured section-pad`,
          children: [
            (0, i.jsxs)(`div`, {
              className: `featured-head`,
              children: [
                (0, i.jsxs)(`div`, {
                  children: [
                    (0, i.jsx)(`p`, {
                      className: `eyebrow`,
                      children: `Selected books`,
                    }),
                    (0, i.jsxs)(`h2`, {
                      children: [
                        `Start with`,
                        (0, i.jsx)(`br`, {}),
                        (0, i.jsx)(`em`, { children: `these worlds.` }),
                      ],
                    }),
                  ],
                }),
                (0, i.jsx)(`p`, {
                  children: `Three very different books. One shared belief: the page should make you want to look closer.`,
                }),
              ],
            }),
            (0, i.jsx)(`div`, {
              className: `book-gallery`,
              children: o.map((e) =>
                (0, i.jsxs)(
                  `a`,
                  {
                    className: `book-card`,
                    href: e.href,
                    "aria-label": `Explore ${e.title}`,
                    children: [
                      (0, i.jsx)(`div`, {
                        className: `display-cover ${e.cover}`,
                        children: (0, i.jsx)(`img`, {
                          src: e.image,
                          alt: e.alt,
                          loading: `lazy`,
                        }),
                      }),
                      (0, i.jsxs)(`div`, {
                        className: `book-meta`,
                        children: [
                          (0, i.jsx)(`span`, { children: e.number }),
                          (0, i.jsx)(`p`, {
                            className: `book-eyebrow`,
                            children: e.eyebrow,
                          }),
                          (0, i.jsx)(`h3`, { children: e.title }),
                          (0, i.jsx)(`p`, { children: e.hook }),
                          (0, i.jsxs)(`div`, {
                            className: `book-actions`,
                            children: [
                              (0, i.jsx)(`span`, {
                                children: `Book details`,
                              }),
                              (0, i.jsxs)(`span`, {
                                children: [
                                  `Explore book `,
                                  (0, i.jsx)(`b`, { children: `↗` }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  },
                  e.title,
                ),
              ),
            }),
          ],
        }),
        (0, i.jsxs)(`section`, {
          id: `manifesto`,
          className: `manifesto`,
          children: [
            (0, i.jsx)(`div`, { className: `manifesto-image` }),
            (0, i.jsxs)(`div`, {
              className: `manifesto-copy`,
              children: [
                (0, i.jsx)(`p`, {
                  className: `eyebrow`,
                  children: `Why Discover Visually`,
                }),
                (0, i.jsxs)(`h2`, {
                  children: [
                    `Some stories need`,
                    (0, i.jsx)(`br`, {}),
                    (0, i.jsx)(`em`, { children: `more than words.` }),
                  ],
                }),
                (0, i.jsx)(`p`, {
                  children: `We make books that reward curiosity—where illustration, typography, history and story work together to turn every page into a discovery.`,
                }),
                (0, i.jsxs)(`a`, {
                  href: `#newsletter`,
                  className: `text-link dark-link`,
                  children: [
                    `Meet the publishing house `,
                    (0, i.jsx)(`span`, { children: `→` }),
                  ],
                }),
              ],
            }),
            (0, i.jsxs)(`div`, {
              className: `manifesto-note`,
              children: [
                (0, i.jsx)(`span`, { children: `Beautiful enough to give.` }),
                (0, i.jsx)(`span`, { children: `Interesting enough to keep.` }),
              ],
            }),
          ],
        }),
        (0, i.jsx)(`section`, {
          id: `newsletter`,
          className: `newsletter section-pad`,
          children: (0, i.jsxs)(`div`, {
            className: `newsletter-inner`,
            children: [
              (0, i.jsx)(`p`, {
                className: `eyebrow`,
                children: `The next chapter`,
              }),
              (0, i.jsxs)(`h2`, {
                children: [
                  `Your next unforgettable`,
                  (0, i.jsx)(`br`, {}),
                  `book `,
                  (0, i.jsx)(`em`, { children: `starts here.` }),
                ],
              }),
              (0, i.jsx)(`p`, {
                children: `Get thoughtful recommendations, visual previews and first access to new releases. Choose the world you want to hear from.`,
              }),
              s
                ? (0, i.jsxs)(`div`, {
                    className: `success-message`,
                    role: `status`,
                    children: [
                      (0, i.jsx)(`span`, { children: `✓` }),
                      (0, i.jsxs)(`div`, {
                        children: [
                          (0, i.jsx)(`b`, { children: `You’re on the list.` }),
                          (0, i.jsx)(`p`, {
                            children: `We’ll send the most relevant worlds your way.`,
                          }),
                        ],
                      }),
                    ],
                  })
                : (0, i.jsxs)(`form`, {
                    onSubmit: (e) => {
                      (e.preventDefault(), c(!0));
                    },
                    children: [
                      (0, i.jsx)(`div`, {
                        className: `interest-options`,
                        "aria-label": `Choose an interest`,
                        children: a.map((e, t) =>
                          (0, i.jsxs)(
                            `label`,
                            {
                              children: [
                                (0, i.jsx)(`input`, {
                                  type: `radio`,
                                  name: `interest`,
                                  value: e.name,
                                  defaultChecked: t === 0,
                                }),
                                (0, i.jsx)(`span`, { children: e.name }),
                              ],
                            },
                            e.name,
                          ),
                        ),
                      }),
                      (0, i.jsxs)(`div`, {
                        className: `email-row`,
                        children: [
                          (0, i.jsxs)(`label`, {
                            children: [
                              (0, i.jsx)(`span`, {
                                className: `sr-only`,
                                children: `Email address`,
                              }),
                              (0, i.jsx)(`input`, {
                                required: !0,
                                type: `email`,
                                placeholder: `Your email address`,
                              }),
                            ],
                          }),
                          (0, i.jsxs)(`button`, {
                            type: `submit`,
                            children: [
                              `Send me recommendations `,
                              (0, i.jsx)(`span`, { children: `↗` }),
                            ],
                          }),
                        ],
                      }),
                      (0, i.jsx)(`small`, {
                        children: `Only meaningful updates. Unsubscribe whenever you like.`,
                      }),
                    ],
                  }),
            ],
          }),
        }),
        (0, i.jsxs)(`footer`, {
          children: [
            (0, i.jsxs)(`a`, {
              href: `#top`,
              className: `brand footer-brand`,
              children: [
                (0, i.jsxs)(`span`, {
                  className: `brand-mark`,
                  "aria-hidden": `true`,
                  children: [(0, i.jsx)(`i`, {}), (0, i.jsx)(`i`, {})],
                }),
                (0, i.jsxs)(`span`, {
                  children: [
                    `Discover `,
                    (0, i.jsx)(`b`, { children: `Visually` }),
                  ],
                }),
              ],
            }),
            (0, i.jsx)(`p`, {
              children: `Books made to be seen, explored and remembered.`,
            }),
            (0, i.jsxs)(`div`, {
              children: [
                (0, i.jsx)(`a`, { href: `#worlds`, children: `Collections` }),
                (0, i.jsx)(`a`, { href: `#featured`, children: `Books` }),
                (0, i.jsx)(`a`, { href: `#manifesto`, children: `About` }),
                (0, i.jsx)(`a`, { href: `#newsletter`, children: `Contact` }),
              ],
            }),
            (0, i.jsx)(`span`, { children: `© 2026 Discover Visually` }),
          ],
        }),
      ],
    })
  );
}
export { s as default };

import "pretendard/dist/web/variable/pretendardvariable.css";
import "overlayscrollbars/overlayscrollbars.css";

import { Global } from "@emotion/react";
import { EntryWrapper } from "@seldszar/yael";
import { ExoticComponent, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { SWRConfig } from "swr";
import tw, { GlobalStyles, css, theme } from "twin.macro";

import { getBaseFontSize, setupSentry, t } from "~/common/helpers";

import { usePreferDarkMode, useSettings } from "./hooks";

setupSentry();

const wrapper: EntryWrapper<ExoticComponent> = (Component) => {
  const container = document.getElementById("app-root");

  if (container == null) {
    return;
  }

  const root = createRoot(container);

  document.documentElement.dir = t("@@bidi_dir");
  document.documentElement.lang = t("@@ui_locale");

  function App() {
    const [settings] = useSettings();

    const darkMode = usePreferDarkMode();

    useEffect(() => {
      const force =
        settings.general.theme === "system" ? darkMode : settings.general.theme === "dark";

      document.documentElement.classList.toggle("dark", force);
    }, [darkMode, settings.general.theme]);

    return (
      <SWRConfig value={{ keepPreviousData: true }}>
        <GlobalStyles />

        <Global
          styles={css`
            @font-face {
              font-family: "Pretendard Fallback";
              src: local("Malgun Gothic");
              ascent-override: 110.17%;
              descent-override: 27.91%;
              line-gap-override: 0%;
              size-adjust: 86.43%;
            }

            ::selection {
              ${tw`bg-emerald-500 text-white`}
            }

            html,
            body {
              font-size: ${getBaseFontSize(settings.general.fontSize)};
            }

            html {
              color-scheme: dark;
            }

            body {
              ${tw`bg-neutral-100 font-sans text-black dark:(bg-neutral-900 text-white)`}
            }

            #modal-root {
              ${tw`absolute z-50`}
            }

            .os-theme-chzzk-now {
              --os-handle-bg-active: ${theme("colors.emerald.600")};
              --os-handle-bg-hover: ${theme("colors.emerald.400")};
              --os-handle-bg: ${theme("colors.emerald.500")};
              --os-handle-border-radius: ${theme("borderRadius.full")};
              --os-handle-interactive-area-offset: 3px;
              --os-padding-axis: 3px;
              --os-padding-perpendicular: 3px;
              --os-size: 8px;

              .os-scrollbar-handle {
                opacity: 0.5;
              }

              &:hover {
                --os-size: 10px;

                .os-scrollbar-handle {
                  opacity: 1;
                }
              }
            }
          `}
        />

        <Component />
      </SWRConfig>
    );
  }

  root.render(<App />);
};

export default wrapper;

import { useEffect } from "react";
import { useRouter } from "next/router";
import { appWithTranslation } from "next-i18next";
import { config } from "@fortawesome/fontawesome-svg-core";

import { initPostHog } from "~/components/analytics/posthog";
import Layout from "~/components/basic/layout";
import NotificationProvider from "~/components/context/Notifications/NotificationProvider";
import RouteGuard from "~/components/RouteGuard";
import { publicPaths } from "~/const";
import { ENV } from "~/utilities/config";

import "@fortawesome/fontawesome-svg-core/styles.css";
import "../styles/globals.css";

config.autoAddCss = false;

const App = ({ Component, pageProps, ...appProps }) => {
  const router = useRouter();
  const posthog = initPostHog();

  // useEffect(() => {
  //   const storedLang = localStorage.getItem("lang");
  //   console.log(router.locale);
  //   console.log(storedLang);
  //   if (router.locale ?? "en" !== storedLang ?? "en") {
  //     router.push(router.pathname, router.pathname, {
  //       locale: storedLang ?? "en",
  //     });
  //   }
  // }, [router.locale, router.pathname]);

  useEffect(() => {
    // Init for auto capturing
    const posthog = initPostHog();

    const handleRouteChange = () => {
      if (typeof window !== "undefined") {
        if (ENV == "production") {
          posthog.capture("$pageview");
        }
      }
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  // If it's one of these routes, don't add the layout (e.g., these routes are external)
  if (
    publicPaths.includes("/" + appProps.router.pathname.split("/")[1]) ||
    !Component.requireAuth
  ) {
    return <Component {...pageProps} />;
  }

  return (
    <RouteGuard>
      <NotificationProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </NotificationProvider>
    </RouteGuard>
  );
};

export default appWithTranslation(App);

{
  /* <Script
src="https://www.googletagmanager.com/gtag/js?id=G-DQ1XLJJGG1"
strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
{`
    window.dataLayer = window.dataLayer || [];
    function gtag(){window.dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-DQ1XLJJGG1');
  `}
</Script> */
}

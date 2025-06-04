// All global styles should be imported here for easier maintenance
import "@liquity2/uikit/index.css";

import type { Metadata, Viewport } from "next";
import { type ReactNode } from "react";

import { BreakpointName } from "@/src/breakpoints";
import { About } from "@/src/comps/About/About";
import { AppLayout } from "@/src/comps/AppLayout/AppLayout";
import { Blocking } from "@/src/comps/Blocking/Blocking";
import content from "@/src/content";
import { DemoMode } from "@/src/demo-mode";
import { VERCEL_ANALYTICS } from "@/src/env";
import { Ethereum } from "@/src/services/Ethereum";
import { ReactQuery } from "@/src/services/ReactQuery";
import { StoredState } from "@/src/services/StoredState";
import { TransactionFlow } from "@/src/services/TransactionFlow";
import { UiKit } from "@liquity2/uikit";
import { Analytics } from "@vercel/analytics/react";
import { GeistSans } from "geist/font/sans";
import { OnboardingProvider } from "./_onboard";

export const metadata: Metadata = {
  title: content.appName,
  icons: "/favicon.ico",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function Layout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={GeistSans.className}>
        <ReactQuery>
          <UiKit>
            <StoredState>
              <BreakpointName>
                <DemoMode>
                  <Ethereum>
                    <Blocking>
                      <OnboardingProvider>
                        <TransactionFlow>
                          <About>
                            <AppLayout>
                              {children}
                            </AppLayout>
                          </About>
                        </TransactionFlow>
                      </OnboardingProvider>
                    </Blocking>
                  </Ethereum>
                </DemoMode>
              </BreakpointName>
            </StoredState>
          </UiKit>
        </ReactQuery>
        {VERCEL_ANALYTICS && <Analytics />}
      </body>
    </html>
  );
}


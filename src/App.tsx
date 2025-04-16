import { Route, Router } from "@solidjs/router";
import { Link, MetaProvider, Title } from "@solidjs/meta";

import { TypingProvider } from "@/contexts/TypingContext";
import { DeviceProvider } from "@/contexts/DeviceContext";
import { InputProvider } from "@/contexts/InputContext";
import { StylingProvider } from "@/contexts/StylingContext";
import MobileBlock from "@/components/MobileBlock";

import IndexPage from "@/routes/index";

export default function App() {
  return (
    <MetaProvider>
      <Title>Analog-type</Title>
      <Link rel="icon" href="/favicon.ico" />
      <MobileBlock />
      <DeviceProvider>
        <InputProvider>
          <TypingProvider>
            <StylingProvider>
              <Router>
                <Route path="/" component={IndexPage} />
              </Router>
            </StylingProvider>
          </TypingProvider>
        </InputProvider>
      </DeviceProvider>
    </MetaProvider>
  );
}

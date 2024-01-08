import { useMemo } from "react";
import { Outlet, isRouteErrorResponse, useRouteError } from "react-router-dom";
import tw, { styled } from "twin.macro";

import { sendRuntimeMessage, t } from "~/common/helpers";
import { useCurrentUser } from "~/browser/hooks";

import Hero from "~/browser/components/Hero";
import Loader from "~/browser/components/Loader";
import LoginButton from "~/browser/components/LoginButton";
import Section from "~/browser/components/Section";
import Sidebar from "~/browser/components/Sidebar";
import Splash from "~/browser/components/Splash";

const Wrapper = styled.div`
  ${tw`flex h-full relative`}
`;

const Body = styled.div`
  ${tw`flex-1 overflow-hidden`}
`;

const Welcome = styled.div`
  ${tw`flex flex-1 flex-col h-full items-center justify-center px-16 text-center`}
`;

const Footer = styled.div`
  ${tw`text-sm`}
`;

export function ChildComponent() {
  const [currentUser] = useCurrentUser({
    suspense: true,
  });

  if (currentUser == null) {
    return (
      <Welcome>
        <Section>
          <Hero />
        </Section>
        <Section>
          <LoginButton
            onClick={() => sendRuntimeMessage("authorize")}
            title={t("buttonText_login")}
          />
        </Section>
        <Footer>{t("detailText_login")}</Footer>
      </Welcome>
    );
  }

  return (
    <>
      <Sidebar user={currentUser} />

      <Body>
        <Outlet />
      </Body>
    </>
  );
}

export function Component() {
  return (
    <Wrapper>
      <Loader>
        <ChildComponent />
      </Loader>
    </Wrapper>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  const title = useMemo(() => {
    if (isRouteErrorResponse(error)) {
      return error.statusText;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return "Unknown error";
  }, [error]);

  return <Splash>{title}</Splash>;
}

export default Component;

import { MouseEventHandler } from "react";
import tw, { styled } from "twin.macro";

import { t } from "~/common/helpers";

import ExternalAnchor from "../ExternalAnchor";
import Hero from "../Hero";
import Modal from "../Modal";
import Panel from "../Panel";
import Section from "../Section";

const allLinks = [
  {
    title: t("linkText_website"),
    url: "https://www.chz.app/",
  },
  {
    title: t("linkText_issues"),
    url: "https://discord.gg/9kq3UNKAkz",
  },
  {
    title: t("linkText_releases"),
    url: "https://www.chz.app/now/patch-notes",
  },
  {
    title: t("linkText_repository"),
    url: "https://github.com/jebibot/cheese-now",
  },
];

const LinkGrid = styled.div`
  ${tw`grid grid-cols-2 gap-x-6 gap-y-1 place-items-center`}
`;

interface AboutModalProps {
  onClose?: MouseEventHandler<HTMLButtonElement>;
}

function AboutModal(props: AboutModalProps) {
  return (
    <Modal>
      <Panel onClose={props.onClose}>
        <Section>
          <Hero />
        </Section>
        <Section>
          <LinkGrid>
            {allLinks.map((props, index) => (
              <ExternalAnchor key={index} to={props.url}>
                {props.title}
              </ExternalAnchor>
            ))}
          </LinkGrid>
        </Section>
      </Panel>
    </Modal>
  );
}

export default AboutModal;

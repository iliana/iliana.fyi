import MailIcon from "heroicons/outline/mail.svg";
import GithubLogo from "ionicons/dist/svg/logo-github.svg";
import TwitterLogo from "ionicons/dist/svg/logo-twitter.svg";
import React from "react";
import Avatar from "../components/avatar";
import Document from "../components/document";
import Prose from "../components/prose";

export default function Index() {
  return (
    <Document>
      <main>
        <h1 className="text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl mb-0.5 lg:mb-1 xl:mb-1.5 2xl:mb-2.5 text-gray-900 dark:text-gray-100 font-semibold">
          <Avatar size="index" />
          iliana etaoin
        </h1>

        <LinkList>
          <li>
            <a href="https://pronoun.is/xie/xer?or=she">
              xie/xer
              <span className="sr-only"> pronouns</span>
            </a>
          </li>
          <li>
            <a href="/lowercase/">always lowercase</a>
          </li>
          <li>
            <a href="/etaoin.flac">pronounced /ɪliˈɑnə ɛˈtiːn/</a>
          </li>
        </LinkList>
        <LinkList>
          <li>
            <LogoLink logo={MailIcon} label="Email" href="mailto:iliana@buttslol.net">
              iliana@buttslol.net
            </LogoLink>
          </li>
          <li>
            <LogoLink logo={TwitterLogo} fill label="Twitter" href="https://twitter.com/ilianathewitch">
              @ilianathewitch
            </LogoLink>
          </li>
          <li>
            <LogoLink logo={GithubLogo} fill label="GitHub" href="https://github.com/iliana">
              @iliana
            </LogoLink>
          </li>
        </LinkList>

        <Prose>{"{{ section.content | safe }}"}</Prose>

        <h2 className="sr-only">Blog</h2>
        {"{% set blog = get_section(path=`blog/_index.md`) %}"}
        <ul>
          {"{% for page in blog.pages %}"}
          <li className="text-sm lg:text-base xl:text-lg 2xl:text-xl my-3.5 lg:my-4 xl:my-5 2xl:my-6">
            <time dateTime="{{ page.date | date }}">{"{{ page.date | date(format=`%B %e, %Y`) }}"}</time>
            <span className="sr-only">: </span>
            <Prose margins={false} className="prose-a:font-extrabold">
              <a href="{{ page.path }}">{"{{ page.title | markdown(inline=true) | safe }}"}</a>
            </Prose>
          </li>
          {"{% endfor %}"}
        </ul>
      </main>
    </Document>
  );
}

function LinkList({ children }) {
  return (
    <ul className="sm:space-x-3 lg:space-x-4.5 xl:space-x-5 2xl:space-x-6">
      {children.map((child) => React.cloneElement(child, { className: "sm:inline" }))}
    </ul>
  );
}

function LogoLink({ logo: Logo, fill, href, label, children }) {
  return (
    <span className="whitespace-nowrap">
      <Logo
        width="1em"
        height="1em"
        fill={fill ? "currentColor" : "none"}
        className="inline mr-1 lg:mr-1.5"
        aria-hidden
        focusable="false"
      />
      <a href={href}>
        <span className="sr-only">{label}: </span>
        {children}
      </a>
    </span>
  );
}

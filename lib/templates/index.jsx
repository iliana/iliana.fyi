import c from "classnames/dedupe";
import MailIcon from "heroicons/outline/mail.svg";
import RssIcon from "heroicons/outline/rss.svg";
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
        <h1
          className={c(
            "text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl",
            "mb-0.5 lg:mb-1 xl:mb-1.5 2xl:mb-2.5",
            "text-gray-900 dark:text-gray-100 font-semibold"
          )}
        >
          <Avatar size="index" href="/iliana.png" />
          iliana etaoin
        </h1>

        <LinkList>
          <LinkListItem>
            <a href="https://pronoun.is/xie/xer?or=she">
              xie/xer
              <span className="sr-only"> pronouns</span>
            </a>
          </LinkListItem>
          <LinkListItem>
            <a href="/lowercase/">always lowercase</a>
          </LinkListItem>
          <LinkListItem>
            <a href="/etaoin.flac">pronounced /ɪliˈɑnə ɛˈtiːn/</a>
          </LinkListItem>
        </LinkList>
        <LinkList>
          <LinkListItem>
            <IconLink icon={MailIcon} label="Email" href="mailto:iliana@buttslol.net">
              iliana@buttslol.net
            </IconLink>
          </LinkListItem>
          <LinkListItem>
            <IconLink icon={TwitterLogo} fill label="Twitter" href="https://twitter.com/ilianathewitch">
              @ilianathewitch
            </IconLink>
          </LinkListItem>
          <LinkListItem>
            <IconLink icon={GithubLogo} fill label="GitHub" href="https://github.com/iliana">
              @iliana
            </IconLink>
          </LinkListItem>
        </LinkList>

        <Prose className="mt-5 lg:mt-6 xl:mt-7 2xl:mt-8 mb-8 lg:mb-9 xl:mb-10 2xl:mb-12">
          {"{{ section.content | safe }}"}
        </Prose>

        <h2 className="sr-only">Blog</h2>
        <ul>
          {"{% for page in section.pages | filter(attribute=`date`) | sort(attribute=`date`) | reverse %}"}
          <li className="text-sm lg:text-base xl:text-lg 2xl:text-xl my-3.5 lg:my-4 xl:my-5 2xl:my-6">
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              <time dateTime="{{ page.date | date }}">{"{{ page.date | date(format=`%B %e, %Y`) }}"}</time>
              {"{% if page.extra is containing(`where`) %}"} &mdash; {"{{ page.extra | get(key=`where`) }}"}
              {"{% endif %}"}
              <span className="sr-only">: </span>
            </p>
            {"{% if page.components[0] == `links` %}"}
            <Prose>{"{{ page.content | safe }}"}</Prose>
            {"{% else %}"}
            <Prose className="prose-a:font-extrabold">
              <a href="{{ page.path }}">{"{{ page.title | markdown(inline=true) | safe }}"}</a>
            </Prose>
            {"{% endif %}"}
          </li>
          {"{% endfor %}"}
        </ul>

        <p className="text-sm lg:text-base xl:text-lg 2xl:text-xl">
          <IconLink icon={RssIcon} iconClassName="text-orange-600 dark:text-orange-400" href="/atom.xml">
            Atom feed
          </IconLink>
        </p>
      </main>
    </Document>
  );
}

function LinkList({ children }) {
  return <ul className="sm:space-x-3 lg:space-x-4 xl:space-x-5 2xl:space-x-6">{children}</ul>;
}

function LinkListItem({ children }) {
  return <li className="sm:inline">{children}</li>;
}

function IconLink({ icon: Icon, iconClassName, fill, href, label, children }) {
  return (
    <span className="whitespace-nowrap">
      <Icon
        width="1em"
        height="1em"
        fill={fill ? "currentColor" : "none"}
        className={c("inline mr-1 lg:mr-1.5", iconClassName)}
        aria-hidden
        focusable="false"
      />
      <a href={href}>
        {label ? <span className="sr-only">{label}: </span> : null}
        {children}
      </a>
    </span>
  );
}

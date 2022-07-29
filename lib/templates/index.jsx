import c from "classnames/dedupe";
import MailIcon from "heroicons/outline/mail.svg";
import RssIcon from "heroicons/outline/rss.svg";
import GithubLogo from "ionicons/dist/svg/logo-github.svg";
import TwitterLogo from "ionicons/dist/svg/logo-twitter.svg";
import React from "react";
import Avatar from "../components/avatar";
import Document from "../components/document";
import Prose from "../components/prose";
import CohostIcon from "./cohost.svg";
import IcosahedronIcon from "./icosahedron.svg";

export default function Index() {
  return (
    <Document>
      <main>
        <h1
          className={c(
            "text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl",
            "mb-1 lg:mb-1.5 xl:mb-2 2xl:mb-2.5",
            "text-gray-900 dark:text-gray-100 font-semibold"
          )}
        >
          <Avatar size="index" href="/iliana.png" />
          iliana etaoin
        </h1>

        <ul className="sm:space-x-3 lg:space-x-4 xl:space-x-5 2xl:space-x-6">
          <li className="sm:inline">
            <a href="https://pronoun.is/xie/xer?or=she">
              xie/xer
              <span className="sr-only"> pronouns</span>
            </a>
          </li>
          <li className="sm:inline">
            <a href="/lowercase/">always lowercase</a>
          </li>
          <li className="sm:inline">
            <a href="/etaoin.flac">pronounced /ɪliˈɑnə ɛˈtiːn/</a>
          </li>
        </ul>

        <ul className="mb-8 lg:mb-9 xl:mb-10 2xl:mb-12">
          <li>
            systems engineer at{" "}
            <a href="https://oxide.computer">
              oxide computer<span className="sr-only sm:not-sr-only"> company</span>
            </a>
          </li>
          <li>
            <IconLink
              icon={MailIcon}
              label="Email"
              prefix="mailto:"
              user="iliana@buttslol.net"
              href="mailto:iliana@buttslol.net"
            />
          </li>
          <li>
            <IconLink
              icon={CohostIcon}
              fill
              label="cohost"
              prefix="cohost.org/"
              user="iliana"
              href="https://cohost.org/iliana"
              rel="me"
            />
          </li>
          <li>
            <IconLink
              icon={GithubLogo}
              fill
              label="GitHub"
              prefix="github.com/"
              user="iliana"
              href="https://github.com/iliana"
              rel="me"
            />
          </li>
          <li>
            <IconLink
              icon={IcosahedronIcon}
              label="Fediverse"
              prefix="icosahedron.website/"
              user="@iliana"
              href="https://icosahedron.website/@iliana"
              rel="me"
            />
          </li>
          <li>
            <IconLink
              icon={TwitterLogo}
              fill
              label="Twitter"
              prefix="twitter.com/"
              user="ilianathewitch"
              href="https://twitter.com/ilianathewitch"
              rel="me"
            />
          </li>
        </ul>

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

function IconLink({ icon: Icon, iconClassName, fill, href, rel, label, prefix, user, children }) {
  return (
    <span className="whitespace-nowrap">
      <Icon
        width="1em"
        height="1em"
        fill={fill ? "currentColor" : "none"}
        className={c("inline mr-1.5 lg:mr-2", iconClassName)}
        aria-hidden
        focusable="false"
      />
      <a href={href} rel={rel}>
        {label ? <span className="sr-only">{label}: </span> : null}
        {prefix ? <span className="opacity-70 dark:opacity-80">{prefix}</span> : null}
        {user ?? children}
      </a>
    </span>
  );
}

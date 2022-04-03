import React from "react";
import { HiOutlineMail } from "react-icons/hi";
import { IoLogoGithub, IoLogoTwitter } from "react-icons/io5";
import Document from "../components/document";
import Prose from "../components/prose";
import { SkipNavContent } from "../components/skip-nav";
import SrOnly from "../components/sr-only";

export default function Index() {
  return (
    <Document>
      <main>
        <h1 className="text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl mb-0.5 lg:mb-1 xl:mb-1.5 2xl:mb-2.5 text-gray-900 dark:text-gray-100 font-semibold">
          iliana etaoin
        </h1>

        <LinkList>
          <li>
            <a href="https://pronoun.is/xie/xer?or=she">
              xie/xer
              <SrOnly> pronouns</SrOnly>
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
            <LogoLink logo={HiOutlineMail} label="Email" href="mailto:iliana@buttslol.net">
              iliana@buttslol.net
            </LogoLink>
          </li>
          <li>
            <LogoLink logo={IoLogoTwitter} label="Twitter" href="https://twitter.com/ilianathewitch">
              @ilianathewitch
            </LogoLink>
          </li>
          <li>
            <LogoLink logo={IoLogoGithub} label="GitHub" href="https://github.com/iliana">
              @iliana
            </LogoLink>
          </li>
        </LinkList>

        <SkipNavContent>
          <Prose>{"{{ section.content | safe }}"}</Prose>

          <h2 className="sr-only">Blog</h2>
          {'{% set blog = get_section(path="blog/_index.md") %}'}
          <ul>
            {"{% for page in blog.pages %}"}
            <li className="text-sm lg:text-base xl:text-lg 2xl:text-xl my-3.5 lg:my-4 xl:my-5 2xl:my-6">
              <time dateTime="{{ page.date | date }}">{'{{ page.date | date(format="%B %e, %Y") }}'}</time>
              <SrOnly>: </SrOnly>
              <Prose noMargins className="prose-a:font-extrabold">
                <a href="{{ page.path }}">{"{{ page.title | markdown(inline=true) | safe }}"}</a>
              </Prose>
            </li>
            {"{% endfor %}"}
          </ul>
        </SkipNavContent>
      </main>
    </Document>
  );
}

function LinkList({ children }) {
  return (
    <ul className="flex flex-col flex-wrap sm:flex-row gap-x-3 lg:gap-x-4.5 xl:gap-x-5 2xl:gap-x-6">{children}</ul>
  );
}

function LogoLink({ logo: Logo, href, label, children }) {
  return (
    <span className="whitespace-nowrap">
      <Logo className="inline mr-1 lg:mr-1.5" aria-hidden focusable="false" />
      <a href={href}>
        <SrOnly>{label}: </SrOnly>
        {children}
      </a>
    </span>
  );
}
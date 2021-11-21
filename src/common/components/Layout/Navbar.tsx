/* eslint-disable jsx-a11y/anchor-is-valid */ // next/link passes href

import { Popover, Transition } from "@headlessui/react"; // TailwindUI
import Link from "next/link"; // Dynamic routing
import { Fragment } from "react"; // State management, Fragment for TailwindUI
import web3 from "@/app/web3"; // Global State
import Wallet from "../Wallet/Wallet";

/*
 * const learn = [
 *   {
 *     name: "FAQ",
 *     description: "Having trouble? Get answers to common questions.",
 *     href: "#",
 *     icon: (
 *       // support-icon heroicon
 *       <svg
 *         xmlns="http://www.w3.org/2000/svg"
 *         className="w-6 h-6"
 *         fill="none"
 *         viewBox="0 0 24 24"
 *         stroke="currentColor"
 *       >
 *         <path
 *           strokeLinecap="round"
 *           strokeLinejoin="round"
 *           strokeWidth={2}
 *           d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
 *         />
 *       </svg>
 *     ),
 *   },
 *   {
 *     name: "Documentation",
 *     description: "For Developers",
 *     href: "#",
 *     icon: (
 *       // document-search
 *       <svg
 *         xmlns="http://www.w3.org/2000/svg"
 *         className="w-6 h-6"
 *         fill="none"
 *         viewBox="0 0 24 24"
 *         stroke="currentColor"
 *       >
 *         <path
 *           strokeLinecap="round"
 *           strokeLinejoin="round"
 *           strokeWidth={2}
 *           d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z"
 *         />
 *       </svg>
 *     ),
 *   },
 * ];
 */

const Navbar = (): JSX.Element => {
  const { address } = web3.useContainer(); // Global state
  return (
    <div id="navContainer">
      <Popover className="flex relative z-30 items-center border-b md:pb-0 h-min md:h-16 border-dark-border bg-dark-background">
        {({ open }) => (
          <>
            <div className="m-auto w-5/6">
              <div className="flex relative flex-col justify-between items-center md:flex-row md:justify-start md:space-x-10">
                <div className="flex flex-col flex-1 justify-start content-center items-center text-center md:flex-row lg:w-0 lg:flex-1">
                  <Link href="/" passHref>
                    <a className="px-2">
                      <p className="text-2xl lg:font-semibold tracking-2-wide font-hero text-dark-primary hover:text-ourange-500">
                        OURZ
                      </p>
                    </a>
                  </Link>
                  <a
                    href="https://www.notion.so/ourz/OURZ-Wiki-722c8f6bb127405991c55a82fba53a52"
                    className="hidden self-center my-auto ml-8 w-auto text-xs tracking-wide text-center capitalize text-dark-primary md:block text-ourange-150 md:pr-8 hover:text-dark-secondary"
                  >
                    About
                  </a>
                  {/* <div className="-my-2 -mr-2 md:hidden">
                    <Popover.Button className="inline-flex justify-center items-center p-2 bg-white text-dark-secondary hover:text-dark-secondary hover:bg-dark-background focus:outline-none focus:ring-2 focus:ring-inset focus:ring-yellow-500">
                      <span className="sr-only">Open menu</span>
                      <MenuIcon className="w-6 h-6" aria-hidden="true" />
                    </Popover.Button>
                  </div> */}

                  {/* <Popover.Group as="nav" className="self-center my-4 space-x-10 md:flex">
                    <Popover className="relative">
                      {({ open }) => (
                        <>
                          <Popover.Button
                            className={classNames(
                              open ? 'text-dark-secondary' : 'text-sm tracking-wider leading-tight capitalize text-dark-secondary',
                              'inline-flex items-center pl-2 bg-white group hover:text-dark-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500'
                            )}
                          >
                            <span className="text-center">Learn</span>
                            //chevron down
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </Popover.Button>

                          <Transition
                            show={open}
                            as={Fragment}
                            enter="transition ease-out duration-200"
                            enterFrom="opacity-0 translate-y-1"
                            enterTo="opacity-100 translate-y-0"
                            leave="transition ease-in duration-150"
                            leaveFrom="opacity-100 translate-y-0"
                            leaveTo="opacity-0 translate-y-1"
                          >
                            <Popover.Panel
                              static
                              className="absolute z-10 px-2 mt-3 -ml-4 w-auto max-w-md transform sm:px-0 lg:ml-0 lg:left-1/2 lg:-translate-x-1/2"
                            >
                              <div className="overflow-hidden ring-1 ring-black ring-opacity-5 shadow-lg">
                                <div className="grid relative gap-6 px-5 py-6 bg-white sm:gap-8 sm:p-8">
                                  {learn.map((item) => (
                                    <a
                                      key={item.name}
                                      href={item.href}
                                      className="flex items-start p-3 -m-3 hover:bg-dark-background"
                                    >
                                      <item.icon className="flex-shrink-0 w-6 h-6 text-yellow-500" aria-hidden="true" />
                                      <div className="mx-4">
                                        <p className="text-base font-medium text-left text-dark-secondary">{item.name}</p>
                                        <p className="hidden mt-1 text-sm text-left text-dark-secondary md:block">{item.description}</p>
                                      </div>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            </Popover.Panel>
                          </Transition>
                        </>
                      )}
                    </Popover>
                  </Popover.Group> */}
                </div>
                <div className="hidden justify-center items-center md:justify-end md:flex md:flex-1 lg:w-0">
                  <Wallet />
                </div>
              </div>
            </div>

            <Transition
              show={open}
              as={Fragment}
              enter="duration-200 ease-out"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="duration-100 ease-in"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Popover.Panel
                focus
                static
                className="absolute inset-x-0 top-0 p-2 transition transform origin-top-right md:hidden"
              >
                <div className="bg-white divide-y-2 divide-gray-50 ring-1 ring-black ring-opacity-5 shadow-lg">
                  <div className="px-5 pt-5 pb-6">
                    <div className="flex justify-between items-center">
                      <div>
                        {/* <img
                          className="w-auto h-8"
                          src="https://tailwindui.com/img/logos/workflow-mark-yellow-600.svg"
                          alt="Workflow"
                        /> */}
                      </div>
                      <div className="-mr-2">
                        <Popover.Button className="inline-flex justify-center items-center p-2 bg-white text-dark-secondary hover:text-dark-secondary hover:bg-dark-background focus:outline-none focus:ring-2 focus:ring-inset focus:ring-yellow-500">
                          <span className="sr-only">Close menu</span>
                          {/* x heroicon */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </Popover.Button>
                      </div>
                    </div>
                  </div>
                  <div className="px-5 py-6 mt-8 mb-4 space-y-6">
                    <div className="grid grid-cols-2 gap-y-6 gap-x-8 mt-6">
                      <a
                        href="#"
                        className="pt-2 text-base font-medium text-dark-secondary hover:text-dark-secondary"
                      >
                        About
                      </a>
                    </div>
                    {/* If user is logged in, show link to their creations */}
                    {address && (
                      <h3>
                        <Link href={`/profile/${address}`}>
                          <a className="">Your Creations</a>
                        </Link>
                      </h3>
                    )}
                    <div className="flex">
                      <Wallet />
                    </div>
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    </div>
  );
};

export default Navbar;

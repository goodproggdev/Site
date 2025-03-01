import React,{useState,useRef,useEffect,MouseEvent}from 'react'
import {Flowbite,Modal,TextInput,Button,DarkThemeToggle}from 'flowbite-react'
interface MNavProps{toggleMenu:()=>void;mobileMenuOpen:boolean;openLoginModal:(e:MouseEvent)=>void;openSignupModal:(e:MouseEvent)=>void;toggleDropdown:()=>void;mobileDropdownOpen:boolean;mobileDropdownRef:React.RefObject<HTMLDivElement>;mobileDropdownButtonRef:React.RefObject<HTMLButtonElement>;mobileMenuRef:React.RefObject<HTMLDivElement>;mobileMenuButtonRef:React.RefObject<HTMLButtonElement>}
const MobileNavbar:React.FC<MNavProps>=({toggleMenu,mobileMenuOpen,openLoginModal,openSignupModal,toggleDropdown,mobileDropdownOpen,mobileDropdownRef,mobileDropdownButtonRef,mobileMenuRef,mobileMenuButtonRef})=>(<>
	<div className="flex md:hidden items-center justify-between">
		<button ref={mobileMenuButtonRef} onClick={toggleMenu} type="button" className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="mobile-menu" aria-expanded={mobileMenuOpen}>
			<span className="sr-only">Open main menu</span>
			<svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
				<path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15"/>
			</svg>
		</button>
		<a href="https://flowbite.com/" className="flex items-center space-x-3 rtl:space-x-reverse">
			<img src="https://flowbite.com/docs/images/logo.svg" className="h-8" alt="Flowbite Logo"/>
			<span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Flowbite</span>
		</a>
		<div className="flex items-center gap-2">
			<DarkThemeToggle/>
			<div className="relative">
				<button ref={mobileDropdownButtonRef} onClick={toggleDropdown} className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
					<img src="https://flowbite.com/docs/images/people/profile-picture-5.jpg" alt="User avatar"/>
				</button>
				{mobileDropdownOpen&&
				<div ref={mobileDropdownRef} className="absolute right-0 mt-2 w-40 bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700">
					<ul className="py-1 text-sm text-gray-700 dark:text-gray-200">
						<li><a href="#" onClick={openLoginModal} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600">Login</a></li>
						<li><a href="#" onClick={openSignupModal} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600">Sign up</a></li>
					</ul>
				</div>}
			</div>
		</div>
	</div>
	{mobileMenuOpen&&
	<div ref={mobileMenuRef} className="md:hidden mt-4">
		<ul className="font-medium flex flex-col p-4 border border-gray-100 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
			<li><a href="#Home" onClick={toggleMenu} className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700" aria-current="page">Home</a></li>
			<li><a href="#about" onClick={toggleMenu} className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">About</a></li>
			<li><a href="#services" onClick={toggleMenu} className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">Services</a></li>
			<li><a href="#pricing" onClick={toggleMenu} className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">Pricing</a></li>
			<li><a href="#contact" onClick={toggleMenu} className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">Contact</a></li>
		</ul>
	</div>}
</>)
interface DNavProps{openLoginModal:(e:MouseEvent)=>void;openSignupModal:(e:MouseEvent)=>void}
const DesktopNavbar:React.FC<DNavProps>=({openLoginModal,openSignupModal})=>(<div className="hidden md:flex flex-wrap items-center justify-between">
	<a href="https://flowbite.com/" className="flex items-center space-x-3 rtl:space-x-reverse">
		<img src="https://flowbite.com/docs/images/logo.svg" className="h-8" alt="Flowbite Logo"/>
		<span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Flowbite</span>
	</a>
	<div className="flex items-center ml-auto space-x-6">
		<DarkThemeToggle/>
		<div className="ml-4"/>
	</div>
	<div className="hidden w-full md:block md:w-auto" id="navbar-default">
		<div className="flex md:flex-row space-x-8 rtl:space-x-reverse">
			<ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
				<li><a href="#Home" className="block py-2 px-3 text-white bg-blue-700 rounded-sm md:bg-transparent md:text-blue-700 md:p-0 dark:text-white md:dark:text-blue-500" aria-current="page">Home</a></li>
				<li><a href="#about" className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">About</a></li>
				<li><a href="#services" className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">Services</a></li>
				<li><a href="#pricing" className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">Pricing</a></li>
				<li><a href="#contact" className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">Contact</a></li>
			</ul>
		</div>
	</div>
	<ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700 ml-auto">
		<li><a href="#" onClick={openLoginModal} className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">Login</a></li>
		<li><a href="#" onClick={openSignupModal} className="block py-2 px-3 text-white bg-blue-700 rounded-sm md:bg-transparent md:text-blue-700 md:p-0 dark:text-white md:dark:text-blue-500">Sign up</a></li>
	</ul>
</div>)
const Navbar:React.FC=()=>{
	const[isLoginOpen,setIsLoginOpen]=useState(false)
	const[isSignupOpen,setIsSignupOpen]=useState(false)
	const[mobileDropdownOpen,setMobileDropdownOpen]=useState(false)
	const[mobileMenuOpen,setMobileMenuOpen]=useState(false)
	const mobileDropdownRef=useRef<HTMLDivElement>(null)
	const mobileDropdownButtonRef=useRef<HTMLButtonElement>(null)
	const mobileMenuRef=useRef<HTMLDivElement>(null)
	const mobileMenuButtonRef=useRef<HTMLButtonElement>(null)
	const openLoginModal=(e:MouseEvent)=>{e.preventDefault();setIsLoginOpen(true);setMobileDropdownOpen(false);setMobileMenuOpen(false)}
	const closeLoginModal=()=>setIsLoginOpen(false)
	const openSignupModal=(e:MouseEvent)=>{e.preventDefault();setIsSignupOpen(true);setMobileDropdownOpen(false);setMobileMenuOpen(false)}
	const closeSignupModal=()=>setIsSignupOpen(false)
	const toggleMobileDropdown=()=>setMobileDropdownOpen(!mobileDropdownOpen)
	const toggleMobileMenu=()=>setMobileMenuOpen(!mobileMenuOpen)
	useEffect(()=>{
		const handleClickOutside=(e:Event)=>{
			if(mobileDropdownOpen&&mobileDropdownRef.current&&!mobileDropdownRef.current.contains(e.target as Node)&&mobileDropdownButtonRef.current&&!mobileDropdownButtonRef.current.contains(e.target as Node))setMobileDropdownOpen(false)
			if(mobileMenuOpen&&mobileMenuRef.current&&!mobileMenuRef.current.contains(e.target as Node)&&mobileMenuButtonRef.current&&!mobileMenuButtonRef.current.contains(e.target as Node))setMobileMenuOpen(false)
		}
		document.addEventListener('mousedown',handleClickOutside)
		return ()=>document.removeEventListener('mousedown',handleClickOutside)
	},[mobileDropdownOpen,mobileMenuOpen])
	return(
		<Flowbite>
			<nav className="bg-white border-gray-200 dark:bg-gray-900">
				<div className="max-w-screen-xl mx-auto p-4">
					<MobileNavbar toggleMenu={toggleMobileMenu} mobileMenuOpen={mobileMenuOpen} openLoginModal={openLoginModal} openSignupModal={openSignupModal} toggleDropdown={toggleMobileDropdown} mobileDropdownOpen={mobileDropdownOpen} mobileDropdownRef={mobileDropdownRef} mobileDropdownButtonRef={mobileDropdownButtonRef} mobileMenuRef={mobileMenuRef} mobileMenuButtonRef={mobileMenuButtonRef}/>
					<DesktopNavbar openLoginModal={openLoginModal} openSignupModal={openSignupModal}/>
				</div>
			</nav>
			<Modal show={isLoginOpen} onClose={closeLoginModal} size="sm">
				<Modal.Header>Login</Modal.Header>
				<Modal.Body>
					<div className="space-y-4">
						<TextInput id="login-email" type="email" placeholder="Your email" required/>
						<TextInput id="login-password" type="password" placeholder="Your password" required/>
					</div>
					<div className="mt-2 text-center">
						<a href="/reset-password" className="text-sm text-blue-500 hover:underline">Forgot your password?</a>
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Button>Login</Button>
					<Button onClick={closeLoginModal} color="gray">Close</Button>
				</Modal.Footer>
			</Modal>
			<Modal show={isSignupOpen} onClose={closeSignupModal} size="sm">
				<Modal.Header>Sign Up</Modal.Header>
				<Modal.Body>
					<div className="space-y-4">
						<TextInput id="signup-email" type="email" placeholder="Your email" required/>
						<TextInput id="signup-password" type="password" placeholder="Your password" required/>
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Button>Sign Up</Button>
					<Button onClick={closeSignupModal} color="gray">Close</Button>
				</Modal.Footer>
			</Modal>
			<style>{`html {scroll-behavior: smooth;}`}</style>
		</Flowbite>
	)
}
export default Navbar

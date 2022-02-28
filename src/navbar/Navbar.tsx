import { faBars, faHamburger } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import './Navbar.css';


export interface NavRoute {
    path: string;
    title: string;
    component: JSX.Element;
}

interface NavigationProps {
    routes: Array<NavRoute>;
    defaultRoute: NavRoute;
}


interface NavbarProps {
    routes: Array<NavRoute>;
    defaultRoute: NavRoute;
    updatePath: Function;
}




function DesktopNavbar(props: NavbarProps) {
    return (
        <div className='DesktopNavbar'>
            <div className='DesktopLogo'
                onClick={() => props.updatePath(props.defaultRoute.path)}>
                <div style={{ 'fontSize': '1.75em' }}>Wikilibs</div>
                <div style={{ 'fontSize': '0.75em' }}>The Silly Encyclopedia</div>
            </div>
            {props.routes.map((route) =>
                <div
                    className='DesktopLink'
                    key={route.path}
                    onClick={() => props.updatePath(route.path)}
                >
                    {route.title}
                </div>)}
        </div >
    );
}






function MobileNavbar(props: NavbarProps) {
    const [isOpen, setIsOpen] = useState<Boolean>(false);
    return (
        <>
            <div className={`NavMenuMask ${isOpen ? 'Visible' : 'Hidden'}`}
                onClick={() => setIsOpen(false)}
            />
            <div className={`NavMenu ${isOpen ? 'Opened' : 'Closed'}`}>
                {props.routes.map(route =>
                    <div
                        key={route.path}
                        className='MobileLink'
                        onClick={() => {
                            props.updatePath(route.path);
                            setIsOpen(false);
                        }}
                    >
                        {route.title}
                    </div>

                )}
            </div>
            <div className='MobileNavbar'>
                <FontAwesomeIcon
                    className="HamburgerButton"
                    icon={faBars}
                    size='2x'
                    onClick={() => setIsOpen(true)} />
                <div className="MobileLogo">Wikilibs</div>
            </div>
        </>
    );
}






const MAX_MOBILE_WIDTH = 990;

const RouterContext =
    createContext((newPath: string) => console.warn('Forgot to set your RouterContext!'));

function Navbar(props: NavigationProps): JSX.Element {

    const [isMobile, setIsMobile] = useState<Boolean>(window.innerWidth <= MAX_MOBILE_WIDTH);
    const [currPath, setCurrPath] = useState<string>(window.location.pathname);
    const currRoute = useMemo(
        () => props.routes.find(route => route.path === currPath) || props.defaultRoute,
        [currPath, props.defaultRoute, props.routes]);


    const updatePath = useCallback((newPath: string) => {
        setCurrPath(newPath);
        window.history.pushState(undefined, '', newPath);
    }, []);


    useEffect(() => {
        const isActualPath = props.routes.some(route => route.path === currPath);
        if (!isActualPath) {
            updatePath(props.defaultRoute.path);
        }
    }, []);


    useEffect(() => {
        function resizeNav() {
            setIsMobile(window.innerWidth <= MAX_MOBILE_WIDTH);
        }
        window.addEventListener('resize', resizeNav);
        return () => window.removeEventListener('resize', resizeNav);
    }, []);



    useEffect(() => {
        document.title = `${currRoute.title} - Wikilibs`
    }, [currRoute]);



    return (
        <div className='NavContainer'>
            {isMobile ?
                <MobileNavbar routes={props.routes}
                    updatePath={updatePath}
                    defaultRoute={props.defaultRoute} /> :
                <DesktopNavbar routes={props.routes}
                    updatePath={updatePath}
                    defaultRoute={props.defaultRoute} />
            }
            <RouterContext.Provider value={(newPath: string) => updatePath(newPath)}>
                {currRoute.component}
            </RouterContext.Provider>
        </div>
    );
}

export { Navbar, RouterContext };
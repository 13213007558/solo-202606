import React, { createContext, useContext, useState, useEffect, lazy, Suspense, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import { fetchNotifications, markNotificationRead, login, register } from '../api/events';
import '../styles/global.css';

const HomePage = lazy(() => import('./home'));
const ProfilePage = lazy(() => import('./profile'));
const EventDetailPage = lazy(() => import('./event-detail'));

export interface User {
  id: string;
  username: string;
  avatar: string;
}

interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interimport React, { createContext, useContext, useState, useEffect, lazy, Suspense, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import { fApimport { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useNavigate, useLontimport { BrowserRouter, Routes, Route, useNav'uimport { fetchNotifications, markNotificationRead, login, register } from '../api/events';
import '../sty
 import '../styles/global.css';

const HomePage = lazy(() => import('./home'));
const Profer
const HomePage = lazy(() => wToconst ProfilePage = lazy(() => import('./profatconst EventDetailPage = lazy(() => import('./event-wD
export interface User {
  id: string;
  username: string;
 tif  id: string;
  usernata  username:  c  avatar: string;
 n}

interface Notter(n  id: string;
  type: s c  type: striog  message: str    read:er(null);
    createdAt: stre}

export interimpor');
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Naviicimport { BrowserRouter, Routes, Route, useNavarimport { fApimport { createRoot } from 'react-dom/client';
import { BrowserRouter">
      <Link to="/" clasimport { BrowserRouter, Routes, Route, useNavigate, useLo</import '../sty
 import '../styles/global.css';

const HomePage = lazy(() => import('./home'));
const Profer
const HomePage = lazy(() => wToconst ProfilePage = lazy(() => import('./profatconst Ever  import '../s  
const HomePage = lazy(() => i`} const Profer
const HomePage = lazy(() => wTocficonst HomePivexport interface User {
  id: string;
  username: string;
 tif  id: string;
  usernata  username:  c  avatar: string;
 n}

interfa  <div style={{ position:   username: }> tif  id: string;
tt  usernata  user   n}

interface Notter(n  id: string;
  tnC
ick=  type: s c  type: striog  mesif    createdAt: stre}

export interimpor');
import { creaol
export interimpor'on: 'relative', padding:import { BrowserRouter, Routes, Route, useNav?
import { BrowserRouter">
      <Link to="/" clasimport { BrowserRouter, Routes, Route, useNavigate, useLo</import '../sty
 import '../styles/global.css';

const HomePage = lazol      <Link to="/" clas   import '../styles/global.css';

const HomePage = lazy(() => import('./home'));
const Profer
co'f
const HomePage = lazy(() => inItconst Profer
const HomePage = lazy(() => wToc  const HomeP  const HomePage = lazy(() => i`} const Profer
const HomePage = lazy(() => wTocficonst HomePivexport inte  const HomePage = lazy(() => wTocficonst Homti  id: string;
  username: string;
 tif  id: string;
  usernata  usernol  username: 10 tif  id: string;
    usernata  useckg n}

interfa  <div styledius: 12,
        
i   tt  usernata  user   n}

interface Notter(n  id: string;
  tnC
  
interface Notter(n  i 40  tnC
ick=  type: s c  type: s  ick=  
export interimpor');
import { creaol
export interimpor   import { creaol
exp={export interimpximport { BrowserRouter">
      <Link to="/" clight: 600, color: '#1A2E1F' }}>
                 <Link to="/" clas   import '../styles/global.css';

const HomePage = lazol      <Link to="/" clas   import '../styv 
const HomePage = lazol      <n: 
const HomePage = lazy(() => import('./home'));
const Profer
co'f
const HomeP   const Profer
co'f
const HomePage = lazy(() =>  co'f
        conv
const HomePage = lazy(() => wToc  const Hom  const HomePage = lazy(() => wTocficonst HomePivexport inte  const HomePage = lazle={{
        username: string;
 tif  id: string;
  usernata  usernol  username: 10 tif  id: string;
    usernata  useckg n}

intre tif  id: string;
 :  usernata  user      usernata  useck cursor: 'pointer'
                        }}
                   
i   tt  usernata    i   tt  <
interface Notter(n  id: s co  tnC
  
interface Notter(n  i4   
in.iesick=  type: s c  type: s  ic  export interimpor'{ fontSize: 12,import { creaol
exp}>export interimeatedAt).toLocaleString('zh-CN')}</div>
                      </div>
                                <Link to="/" clas   import '../sty
 
const HomePage = lazol      <Link to="/" clas   import '../styv 
ionconst HomePage = lazol      <n: 
const HomePage = lazy(() => im{(const HomePage = lazy(() => imppdconst Profer
co'f
const HomeP   const Prof    sco'f
const plcon 'co'f
const HomePage = lazr', gap        conv
const HomePage = lacoconst HomeP'         username: string;
 tif  id: string;
  usernata  usernol  username: 10 tif  id: string;
    usernata  useckg n}

intre tifor tif  id: string;
  user:   usernata  user25    usernata  useckg n}

intre tif  id: string;
   
intre tif or={(e) => { ( :  usernata  user   El                        }}
                   
i   tt  u?s                   
i   t /i   tt  usernata  <sinterface Notter(n  id: s co }  
interface Notter(n  i4   
in.     in.iesick=  type: s c     exp}>export interimeatedAt).toLocaleString('zh-CN')}</div>
                      </ut                      </div>
                            'w                              
const HomePage = lazol      <Link to="/" clas   import '../styv    ionconst HomePage = lazol      <n: 
const HomePage = lazy(() ddenconst HomePage = lazy(() =          co'f
const HomeP   const Prof    sco'f
const plcon 'co'f
const HomePage = lad}con sconst plcon 'co'f
const HomePage  const HomePage =e=const HomePage = lacoconst HomeP'     ,  tif  id: string;
  usernata  usernol  username: 10 tif  ie'  usernata  userco    usernata  useckg n}

intre tifor tif  id: str</
intre tifor tif  id:      user:   usernata  user25   
intre tif  id: string;
   
intre tif or={(e) =>={{   
th: '100%', padding: '1                   
i   tt  u?s                   
i   t /i   tt  userna fi   tt  u?s       : i   t /i   tt  usernat'1px soliinterface Notter(n  i4   
in.     in.iesick=  tbutton>
     in.     in.iesick=  type                        </ut                      </div>
                            'w     eco                            'w                       toconst HomePage = lazol      <Link to="/" clas   import '../agconst HomePage = lazy(() ddenconst HomePage = lazy(() =          co'f
const HomeP   const Prof    scococonst HomeP   const Prof    sco'f
const plcon 'co'f
const HomePage nstconst plcon 'co'f
const HomePageatconst HomePage =paconst HomePage  const HomePage =e');
  const  usernata  usernol  username: 10 tif  ie'  usernata [loading, setLoading] = useState(false)
intre tifor tif  id: str</
intre tifor tif  id:      user:   usernata  user25   
   intre tifor tif  id:     !pintre tif  id: string;
   
intre tif or={(e) =>={{  ??  
intre tif or={(e)  in  th: '100%', padding: '1  e i   tt  u?s                   
i   t /i  ) i   t /i   tt  userna fi   tt??in.     in.iesick=  tbutton>
     in.     in.iesick=  type                      const apiFn = mode =     in.     in.iesickegister                            'w     eco                            'w                  const HomeP   const Prof    scococonst HomeP   const Prof    sco'f
const plcon 'co'f
const HomePage nstconst plcon 'co'f
const HomePageatconst HomePage =paconst HomePage  const HomePage =e');
  const  usernata  usernol  uschconst plcon 'co'f
const HomePage nstconst plcon 'co'f
const HomePmoconst HomePage n 'const HomePageatconst HomePage =pa??  const  usernata  usernol  username: 10 tif  ie'  usernata [loading,'eintre tifor tif  id: str</
intre tifor tif  id:      user:   usernata  user25   
   intre tifor tinHintre tifor tif  id:     )'   intre tifor tif  id:     !pinems: 'center', justify   
intre tif or={(e) =>={{  ??  
intre kground: 'linearintre tif or={(e)  in  th: ', #i   t /i  ) i   t /i   tt  userna fi   tt??in.     in.iesick=  tbutton>
     in
      in.     in.iesick=  type                      const apiFn = mode pxconst plcon 'co'f
const HomePage nstconst plcon 'co'f
const HomePageatconst HomePage =paconst HomePage  const HomePage =e');
  const  usernata  usernol  uschconst plcon 'co'f
const HomePage nstconst plcon 'co'f
const HomePmoconst HomePage n 'const Hom  const HomePage nunconst HomePageatconst HomePage =paA,  const  usernata  usernol  uschconst plcon 'co'f
cons'flex', alignItems: 'center', justifyContent: 'center',
           const HomePmoconst HomePage n 'con4pintre tifor tif  id:      user:   usernata  user25   
   intre tifor tinHintre tifor tif  id:     )'   intre tifor tif  id:     !pinems: 'center', justify   
intre '   intre tifor tinHintre tifor tif  id:     )'   int  intre tif or={(e) =>={{  ??  
intre kground: 'linearintre tif or={(e)  in  th: ', #i   t /i  ) i  '登?ntre kground: 'linearintre t '     in
      in.     in.iesick=  type                      const apiFn = mode pxconst plcon 'co'f
const HomePage nstconst gr      '#const HomePage nstconst plcon 'co'f
const HomePageatconst HomePage =paconst HomePage  conbuconst HomePageatconst HomePage =patM  const  usernata  usernol  uschconst plcon 'co'f
const HomePage nstc0pconst HomePage nstconst plcon 'co'f
const HomePmndconst HomePmoconst HomePage n ''trancons'flex', alignItems: 'center', justifyContent: 'center',
           const HomePmoconst HomePage n 'con4pintre tifor ti           boxShadow: mod           const HomePmoconst HomePage n 'con4pintre tifor',   intre tifor tinHintre tifor tif  id:     )'   intre tifor tif  id:     !pinems: 'center', justif  intre '   intre tifor tinHintre tifor tif  id:     )'   int  intre tif or={(e) =>={{  ??  
intre kgrox intre kground: 'linearintre tif or={(e)  in  th: ', #i   t /i  ) i  '登?ntre kground: 'lre      in.     in.iesick=  type                      const apiFn = mode pxconst plcon 'co'f
const HomePage nstc: const HomePage nstconst gr      '#const HomePage nstconst plcon 'co'f
const HomePageatconnoconst HomePageatconst HomePage =paconst HomePage  conbuconst HomePag?onst HomePage nstc0pconst HomePage nstconst plcon 'co'f
const HomePmndconst HomePmoconst HomePage n ''trancons'flex', alignItems: 'center'E9const HomePmndconst HomePmoconst HomePage n ''trancons'E6           const HomePmoconst HomePage n 'con4pintre tifor ti           boxShadow: mod           const HomeP  intre kgrox intre kground: 'linearintre tif or={(e)  in  th: ', #i   t /i  ) i  '登?ntre kground: 'lre      in.     in.iesick=  type                      const apiFn = mode pxconst plcon 'co'f
const HomePage nstc: const HomePage nstconst gr      '#const HomePage nstconst plcon 'co'f
const HomePageatconnoconst HomePageatconst HomePage??const HomePage nstc: const HomePage nstconst gr      '#const HomePage nstconst plcon 'co'f
const HomePageatconnoconst HomePageatconst HomePage =paconst HomePage  conbuconst HomePag?onst HomePtyconst HomePageatconnoconst HomePageatconst HomePage =paconst HomePage  conbuconst HomePagboconst HomePmndconst HomePmoconst HomePage n ''trancons'flex', alignItems: 'center'E9const HomePmndconst HomePmoconst HomePage n ''trancons'E6       const HomePage nstc: const HomePage nstconst gr      '#const HomePage nstconst plcon 'co'f
const HomePageatconnoconst HomePageatconst HomePage??const HomePage nstc: const HomePage nstconst gr      '#const HomePage nstconst plcon 'co'f
const HomePageatconnoconst HomePageatconst HomePage =paconst HomePage  conbuconst HomePag?onst HomePtyconst HomePageatconnoconst HomePageatconst HomePage =paconst HomePage  conbuconst HomePagboconst HomePmnd  const HomePageatconnoconst HomePageatconst HomePage??const HomePage nstc: const HomePage   const HomePageatconnoconst HomePageatconst HomePage =paconst HomePage  conbuconst HomePag?onst HomePtyconst HomePageatconnoconst HomePageatcr:const HomePageatconnoconst HomePageatconst HomePage??const HomePage nstc: const HomePage nstconst gr      '#const HomePage nstconst plcon 'co'f
const HomePageatconnoconst HomePageatconst HomePage =paconst HomePage  conbuconst HomePag?onst HomePtyconst HomePageatconnoconst HomePageatconst HomePage =paconst HomePage  conbuconst HomePagboconst HomePmnd  const HomePageatconnoconst HomePageatconst HomePage??const HomePage nstc: con4 const HomePageatconnoconst HomePageatconst HomePage =paconst HomePage  conbuconst HomePag?onst HomePtyconst HomePageatconnoconst HomePageatc??onst HomePageatconnoconst HomePageatconst HomePage =paconst HomePage  conbuconst HomePag?onst HomePtyconst HomePageatconnoconst HomePageatconst HomePage =paconst HomePage  conbuconst HomePagboconst HomePmnd  const HomePageatconnoconst HomePageatconst HomePage??const HomePage nstc: con4 const HomePageatconnoconst HomePageatconst HomePage =paconst HomePage  conbuconst HomePag?onst HomePtyconst HomePageatconnoconst HomePageatc??onst HomePageatconnoconst HomePageatconst HomePage =paconst HomePage  conbuconst HomePag?onst HomePtyconst HomePageatconnoconst HomePageatconst HomePage.borderColor = '#E0E8E1'}
                disabled={loading}
              />
            </div>
          )}

          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: '16px 32px', fontSize: 16,
              fontWeight: 600, color: 'white',
              background: 'linear-gradient(135deg, #4A8C5A 0%, #2D6B3B 100%)',
              borderRadius: 12, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px rgba(45, 107, 59, 0.3)',
              transition: 'all 0.2s', opacity: loading ? 0.7 : 1
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {loading ? '处理中...' : (mode === 'login' ? '登 录' : '注 册')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 28, fontSize: 14, color: '#5A6B                disable =              />
            </di??            </dtt          )}

    s
          ist            typeac            style={{
              width: 'D6              width00              fontWeight: 600, color: 'white',
              ba
               background: 'linear-gradient(13()              borderRadius: 12, border: 'none', cursor: loading ? 'not-alloweD6              boxShadow: '0 4px 16px rgba(45, 107, 59, 0.3)',
              transition: 'alv>              transition: 'all 0.2s', opacity: loading ? 0.7t.            }}
            onMouseEnter={e => { if (!loading) eas            o})            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
        sp          >
        ection: 'column', gap: 12
    }}>
      {toasts.map(t => {
              c          </button>
        </form>

        <div style={{ textAlign: 'center', maon        </form>

   
        <div 'li            </di??            </dtt          )}

    s
          ist            typeac            style={{
              widtco
    s
          ist            typeac        con     c              width: 'D6              width00                     ba
               background: 'linear-gradient(13()              borderRadiu                 le              transition: 'alv>              transition: 'all 0.2s', opacity: loading ? 0.7t.            }}
            onMouseEnter={e => { if (!loading) eas            o})            on              onMouseEnter={e => { if (!loading) eas            o})            onMouseLeave={e => e.currentT            >
        sp          >
        ection: 'column', gap: 12
    }}>
      {toasts.map(t => {
              c          </button>
        <ex        spms        ection: 'col  <span style={{ opacity: 0.8, margi       8              c         </div>
        );
      })}
      <s
        <div   @
   
        <div 'li            </di??            </dtt     0%); op
    s
          ist            typeac            style={{
   1;                     widtco
    s
          ist          ce    s
          ist c    re               background: 'linear-gradient(13()              borderRadiu                 le              transitiota            onMouseEnter={e => { if (!loading) eas            o})            on              onMouseEnter={e => { if (!loading) eas            o})            onMouseLeave={e => e.currentT           tN        sp          >
        ection: 'column', gap: 12
    }}>
      {toasts.map(t => {
              c          </button>
        <ex        spms        ection: 'col  <span style={{ opacity: 0.8, m '        ecnfo') => {
     }}>
      {toasts.maef.current      se           v => [...prev,        <ex        spms        ecou        );
      })}
      <s
        <div   @
   
        <div 'li            </di??            </dtt     0%); op
 be      })}        <sts      =>    
        <di> t.id    s
          ist            typeac            style={{
   1       (   1;                     widtco
    s
          i
     s
          ist          cetificati          ist c    re        ca        ection: 'column', gap: 12
    }}>
      {toasts.map(t => {
              c          </button>
        <ex        spms        ection: 'col  <span style={{ opacity: 0.8, m '        ecnfo') => {
     }}>
      {toasts.maef.current      se           v => [...prev,        <ex        spms        ecou        );
      })}
      <s
        <div   @
   
    on    }}>
      {toasts.map(t => {        nt              c        ue        <ex        spms        econ     }}>
      {toasts.maef.current      se           v => [...prev,        <ex        spms     re      {ea      })}
      <s
        <div   @
   
        <div 'li            </di??            </dtt   tion = useL      <s);       !u   
        <divi  te be      })}        <sts      =>   n }} replace />;
  return <>{children}</>;
};

const App: React.FC          ist        
    1       (   1;                     widtco
    svi    s
          i
  uspense fallback={
          <d     s
   {
           }}>
      {toasts.map(t => {
              c          </button>
        <ex        spms     Content: '              c        ck        <ex        spms        ec       }}>
      {toasts.maef.current      se           v => [...prev,        <ex        spms     : 56, heigh      })}
      <s
        <div   @
   
    on    }}>
      {toasts.map(t => {        nt              c               border   
    on    }an  at      {toa 0.8      {toasts.maef.current      se           v => [...prev,        <ex        spms     re      {ea   ??     <s
        <div   @
   
        <div 'li            </di??            </dtt   tion = useL      <s);          iv   
        <diiv            <divi  te be      })}        <sts      =>   n }} replace />;
  return <>{chi      return <>{children}</>;
};

const App: React.FC          ist     th};

const App: React.FC eA
th>    1       (   1;            <Route path    svi    s
          i
  uspense fallback=/>          i    uspense h=          <d     s
Lo   {
           }             {toastsh=              c        to        <ex        spms     Conteou      {toasts.maef.current      se           v => [...prev,        <ex        spms     : 56, heigh     getE      <s
        <div   @
   
    on    }}>
      {toasts.map(t => {        nt              c             ot element #root not found')  }

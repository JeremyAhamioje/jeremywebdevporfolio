import { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { ThemeProvider } from '@/contexts/ThemeContext'

const Home              = lazy(() => import('@/pages/Home'))
const Projects          = lazy(() => import('@/pages/Projects'))
const Services          = lazy(() => import('@/pages/Services'))
const WorkInProgress    = lazy(() => import('@/pages/WorkInProgress'))
const Connect           = lazy(() => import('@/pages/Connect'))
const FreelancePage     = lazy(() => import('@/pages/Freelance'))
const DesignPage        = lazy(() => import('@/pages/Design'))
const MotionDesignPage  = lazy(() => import('@/pages/MotionDesign'))
const ProductMgmtPage   = lazy(() => import('@/pages/ProductManagement'))

// StrictMode is intentionally NOT used — see comment in Services.tsx for rationale.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/"                   element={<Home />}            />
          <Route path="/projects"           element={<Projects />}        />
          <Route path="/services"           element={<Services />}        />
          <Route path="/wip"               element={<WorkInProgress />}  />
          <Route path="/connect"           element={<Connect />}         />
          <Route path="/freelance"         element={<FreelancePage />}   />
          <Route path="/design"            element={<DesignPage />}      />
          <Route path="/motion-design"     element={<MotionDesignPage />}/>
          <Route path="/product-management" element={<ProductMgmtPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </ThemeProvider>
)

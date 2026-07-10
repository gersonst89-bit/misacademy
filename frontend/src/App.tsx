import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import React, { useEffect, Suspense, lazy } from "react";
import { useParams } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "./hooks/redux";
import { setCourseId, resetEvaluation } from "./store/evaluationSlice";

// Components that should stay in the main bundle for immediate structure
import ScrollToTop from "./Components/ScrollToTop";
import DefaultLayout from "./Components/DefaultLayout";
import NoHeaderFooterLayout from "./Components/NoHeaderFooterLayout";

// Lazy Loaded Pages & Components
const Hero = lazy(() => import("./Components/Hero"));
const WhyChoose = lazy(() => import("./Components/WhyChooseUs"));
const LineasCursos = lazy(() => import("./Components/LineasCursos"));
const Metodologia = lazy(() => import("./Components/Metodologia"));
const Opiniones = lazy(() => import("./Components/Opiniones"));
const CursosDestacadosHome = lazy(() => import("./Components/CursosDestacadosHome"));
const RegisterForm = lazy(() => import("./Components/RegisterForm"));
// En la ruta /contacto, el mismo formulario actúa como formulario de contacto
const ContactForm = lazy(() => import("./Components/RegisterForm"));

const CursosPage = lazy(() => import("./cursos/page"));
const LoginPage = lazy(() => import("./login/page"));
const RegistroPage = lazy(() => import("./registro/page"));
const Pago = lazy(() => import("./pago/page"));
const LineasListPage = lazy(() => import("./lineas-academicas/LineasListPage"));
const LineaAcademicaPage = lazy(() => import("./lineas-academicas/LineaAcademicaPage"));
const DetalleRutaPage = lazy(() => import("./detalle/DetalleRutaPage"));
const AdminPage = lazy(() => import("./admin/page"));
const VerificadoPage = lazy(() => import("./verificado/page"));
const Certificado = lazy(() => import("./certificado/page"));
const CursoDetalle = lazy(() => import("./cursos/CursoDetalle"));
const MisCompras = lazy(() => import("./compras/page"));
const NotFound = lazy(() => import("./404/404"));
const Terminos = lazy(() => import("./terminos/page"));
const Reclamaciones = lazy(() => import("./reclamaciones/page"));
const Carrito = lazy(() => import("./carrito/page"));
const PerfilPage = lazy(() => import("./perfil/page"));
const CursoPlayerPage = lazy(() => import("./cursos/VideoPage"));
const MisReseñas = lazy(() => import("./resenas/page"));
const MisCertificados = lazy(() => import("./certificados/page"));
const PaginaLeccion = lazy(() => import("./cursos/PaginaLeccion"));
const ConsultaLinea = lazy(() => import("./consulta/ConsultaLinea"));

const EligibilityCheck = lazy(() => import("./Components/Evaluation/EligibilityCheck"));
const InstructionsScreen = lazy(() => import("./Components/Evaluation/InstructionsScreen"));
const QuizScreen = lazy(() => import("./Components/Evaluation/QuizScreen/QuizScreen"));
const ResultsScreen = lazy(() => import("./Components/Evaluation/ResultsScreen"));
const ReviewScreen = lazy(() => import("./Components/Evaluation/ReviewScreen"));
const EvaluationLayout = lazy(() => import("./Components/Evaluation/EvaluationLayout"));
const ProtectedAdminRoute = lazy(() => import("./Components/ProtectedAdminRoute"));
const ProtectedRoute = lazy(() => import("./Components/ProtectedRoute"));
const PublicRoute = lazy(() => import("./Components/PublicRoute"));

/**
 * Pantalla de carga elegante para las transiciones entre páginas
 */
const LoadingScreen = () => (
  <div className="fixed inset-0 z-[9999] bg-[#03070c] flex flex-col items-center justify-center">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>
      <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-sky-400/30 rounded-full animate-pulse"></div>
    </div>
    <p className="mt-6 text-sky-400/60 text-[10px] font-bold tracking-[0.3em] uppercase animate-pulse">
      Cargando Academia
    </p>
  </div>
);

// Wrapper component that uses useParams INSIDE the Router context
function EvaluationRouteWrapper() {
  const currentScreen = useAppSelector(
    (state) => state.evaluation.currentScreen
  );
  const courseId = useAppSelector((state) => state.evaluation.courseId);
  const dispatch = useAppDispatch();
  const params = useParams();

  useEffect(() => {
    if (params.courseId && params.courseId !== courseId) {
      dispatch(resetEvaluation());
      dispatch(setCourseId(params.courseId));
    }
  }, [params.courseId, courseId, dispatch]);

  return (
    <EvaluationLayout>
      {currentScreen === "eligibility" && <EligibilityCheck />}
      {currentScreen === "instructions" && <InstructionsScreen />}
      {currentScreen === "quiz" && <QuizScreen />}
      {currentScreen === "results" && <ResultsScreen />}
      {currentScreen === "review" && <ReviewScreen />}
    </EvaluationLayout>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="App">
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Home */}
            <Route
              path="/"
              element={
                <DefaultLayout>
                  <Hero />
                  <WhyChoose />
                  <LineasCursos />
                  <Metodologia />
                  <Opiniones />
                  <CursosDestacadosHome />
                  <RegisterForm />
                </DefaultLayout>
              }
            />

            {/* Cursos */}
            <Route
              path="/cursos"
              element={
                <DefaultLayout>
                  <CursosPage />
                </DefaultLayout>
              }
            />
            <Route
              path="/curso/:slug"
              element={
                <DefaultLayout>
                  <CursoDetalle />
                </DefaultLayout>
              }
            />
            <Route
              path="/video-page/:slug"
              element={
                <ProtectedRoute>
                  <DefaultLayout>
                    <CursoPlayerPage />
                  </DefaultLayout>
                </ProtectedRoute>
              }
            />

            {/* Líneas académicas */}
            <Route
              path="/lineas-academicas"
              element={
                <DefaultLayout>
                  <LineasListPage />
                </DefaultLayout>
              }
            />
            <Route
              path="/lineas-academicas/:slug"
              element={
                <DefaultLayout>
                  <LineaAcademicaPage />
                </DefaultLayout>
              }
            />
            <Route
              path="/lineas-academicas/:slug/:rutaTitle"
              element={
                <DefaultLayout>
                  <DetalleRutaPage />
                </DefaultLayout>
              }
            />
            <Route
              path="/ruta/:rutaTitle"
              element={
                <DefaultLayout>
                  <DetalleRutaPage />
                </DefaultLayout>
              }
            />

            {/* Pago */}
            <Route
              path="/pago"
              element={
                <ProtectedRoute>
                  <DefaultLayout>
                    <Pago />
                  </DefaultLayout>
                </ProtectedRoute>
              }
            />

            {/* Auth/Admin */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <NoHeaderFooterLayout>
                    <LoginPage />
                  </NoHeaderFooterLayout>
                </PublicRoute>
              }
            />
            <Route
              path="/registro"
              element={
                <PublicRoute>
                  <NoHeaderFooterLayout>
                    <RegistroPage />
                  </NoHeaderFooterLayout>
                </PublicRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <NoHeaderFooterLayout>
                    <AdminPage />
                  </NoHeaderFooterLayout>
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/verificado"
              element={
                <NoHeaderFooterLayout>
                  <VerificadoPage />
                </NoHeaderFooterLayout>
              }
            />

            {/* Otras páginas */}
            <Route
              path="/certificado/:codigo"
              element={
                <DefaultLayout>
                  <Certificado />
                </DefaultLayout>
              }
            />
            <Route
              path="/compras"
              element={
                <ProtectedRoute>
                  <DefaultLayout>
                    <MisCompras />
                  </DefaultLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/resenas"
              element={
                <ProtectedRoute>
                  <DefaultLayout>
                    <MisReseñas />
                  </DefaultLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/certificados"
              element={
                <ProtectedRoute>
                  <DefaultLayout>
                    <MisCertificados />
                  </DefaultLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/terminos"
              element={
                <DefaultLayout>
                  <Terminos />
                </DefaultLayout>
              }
            />
            <Route
              path="/reclamaciones"
              element={
                <DefaultLayout>
                  <Reclamaciones />
                </DefaultLayout>
              }
            />
            <Route
              path="/contacto"
              element={
                <DefaultLayout>
                  <ContactForm />
                </DefaultLayout>
              }
            />

            <Route
              path="/consulta"
              element={
                <DefaultLayout>
                  <ConsultaLinea />
                </DefaultLayout>
              }
            />

            <Route
              path="/carrito"
              element={
                <ProtectedRoute>
                  <DefaultLayout>
                    <Carrito />
                  </DefaultLayout>
                </ProtectedRoute>
              }
            />

            {/* Perfil SIEMPRE sin ID en la URL */}
            <Route
              path="/perfil"
              element={
                <ProtectedRoute>
                  <DefaultLayout>
                    <PerfilPage />
                  </DefaultLayout>
                </ProtectedRoute>
              }
            />
            {/* Compatibilidad: si alguien entra a /perfil/33 -> redirige a /perfil */}
            <Route
              path="/perfil/:id"
              element={<Navigate to="/perfil" replace />}
            />

            <Route
              path="/curso/:idCurso/leccion/:idLeccion"
              element={
                <ProtectedRoute>
                  <PaginaLeccion />
                </ProtectedRoute>
              }
            />
            <Route
              path="/evaluation/:courseId"
              element={
                <ProtectedRoute>
                  <EvaluationRouteWrapper />
                </ProtectedRoute>
              }
            />

            {/* 404 - Must be LAST route */}
            <Route
              path="*"
              element={
                <DefaultLayout>
                  <NotFound />
                </DefaultLayout>
              }
            />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;


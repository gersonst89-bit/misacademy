import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Hero from "./components/Hero";
import WhyChoose from "./components/WhyChooseUs";
import LineasCursos from "./components/LineasCursos";
import Metodologia from "./components/Metodologia";
import Opiniones from "./components/Opiniones";
import RegisterForm from "./components/RegisterForm";
import CursosPage from "./cursos/page";
import LoginPage from "./login/page";
import RegistroPage from "./registro/page";
import Pago from "./pago/page";
import LineasListPage from "./lineas-academicas/LineasListPage";
import LineaAcademicaPage from "./lineas-academicas/LineaAcademicaPage";
import DetalleRutaPage from "./detalle/DetalleRutaPage";
import NoHeaderFooterLayout from "./components/NoHeaderFooterLayout";
import DefaultLayout from "./components/DefaultLayout";
import AdminPage from "./admin/page";
import VerificadoPage from "./verificado/page";
import Certificado from "./certificado/page";
import CursoDetalle from "./cursos/CursoDetalle";
import MisCompras from "./compras/page";
import NotFound from "./404/404";
import Terminos from "./terminos/page";
import Reclamaciones from "./reclamaciones/page";
import Carrito from "./carrito/page";
import PerfilPage from "./perfil/page";
import CursoPlayerPage from "./cursos/VideoPage";
import MisReseñas from "./reseñas/page";
import MisCertificados from "./certificados/page";
import PaginaLeccion from "./cursos/PaginaLeccion";
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { setCourseId } from "./store/evaluationSlice";
import EligibilityCheck from "./components/Evaluation/EligibilityCheck";
import InstructionsScreen from "./components/Evaluation/InstructionsScreen";
import QuizScreen from "./components/Evaluation/QuizScreen/QuizScreen";
import ResultsScreen from "./components/Evaluation/ResultsScreen";
import ReviewScreen from "./components/Evaluation/ReviewScreen";
import EvaluationLayout from "./components/Evaluation/EvaluationLayout";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import ConsultaLinea from "./consulta/ConsultaLinea";

function App() {
  const currentScreen = useSelector(
    (state: any) => state.evaluation.currentScreen
  );
  const courseId = useSelector((state: any) => state.evaluation.courseId);
  const dispatch = useDispatch();

  const params = useParams();
  useEffect(() => {
    if (params.courseId && params.courseId !== courseId) {
      dispatch(setCourseId(params.courseId));
    }
  }, [params.courseId, courseId, dispatch]);

  return (
    <Router>
      <ScrollToTop />
      <div className="App">
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
            path="/video-page/:cursoIdSlug"
            element={
              <DefaultLayout>
                <CursoPlayerPage />
              </DefaultLayout>
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
              <DefaultLayout>
                <Pago />
              </DefaultLayout>
            }
          />

          {/* Auth/Admin */}
          <Route
            path="/login"
            element={
              <NoHeaderFooterLayout>
                <LoginPage />
              </NoHeaderFooterLayout>
            }
          />
          <Route
            path="/registro"
            element={
              <NoHeaderFooterLayout>
                <RegistroPage />
              </NoHeaderFooterLayout>
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
            path="/certificado"
            element={
              <DefaultLayout>
                <Certificado />
              </DefaultLayout>
            }
          />
          <Route
            path="/compras"
            element={
              <DefaultLayout>
                <MisCompras />
              </DefaultLayout>
            }
          />
          <Route
            path="/reseñas"
            element={
              <DefaultLayout>
                <MisReseñas />
              </DefaultLayout>
            }
          />
          <Route
            path="/certificados"
            element={
              <DefaultLayout>
                <MisCertificados />
              </DefaultLayout>
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
                <RegisterForm />
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
              <DefaultLayout>
                <Carrito />
              </DefaultLayout>
            }
          />

          {/* Perfil SIEMPRE sin ID en la URL */}
          <Route
            path="/perfil"
            element={
              <DefaultLayout>
                <PerfilPage />
              </DefaultLayout>
            }
          />
          {/* Compatibilidad: si alguien entra a /perfil/33 -> redirige a /perfil */}
          <Route
            path="/perfil/:id"
            element={<Navigate to="/perfil" replace />}
          />

          {/* 404 */}
          <Route
            path="*"
            element={
              <DefaultLayout>
                <NotFound />
              </DefaultLayout>
            }
          />
          <Route
            path="/curso/:idCurso/leccion/:idLeccion"
            element={<PaginaLeccion />}
          />
          <Route
            path="/evaluation/:courseId"
            element={
              <EvaluationLayout>
                {currentScreen === "eligibility" && <EligibilityCheck />}
                {currentScreen === "instructions" && <InstructionsScreen />}
                {currentScreen === "quiz" && <QuizScreen />}
                {currentScreen === "results" && <ResultsScreen />}
                {currentScreen === "review" && <ReviewScreen />}
              </EvaluationLayout>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

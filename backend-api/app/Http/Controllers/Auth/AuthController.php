<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\Auth\AuthService;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\VerificationMail;
use App\Mail\ResetPasswordMail;
use Illuminate\Support\Facades\Hash;
use App\Models\AuthenticationLog;
use App\Models\Usuario;

class AuthController extends Controller
{
    
    protected $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function register(RegisterRequest $request)
    {
        try {
            $data = $request->validated();
            [$user, $token] = $this->authService->register($data);
            Mail::to($user->email)->send(new VerificationMail($user->nombre, $token));
            return response()->json([
                'message' => 'Usuario registrado. Revisa tu correo para verificar la cuenta.',
                'user' => [
                    'id_usuario' => $user->id_usuario,
                    'nombre' => $user->nombre,
                    'apellido' => $user->apellido,
                    'email' => $user->email
                ]
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al registrar usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function login(LoginRequest $request)
    {
        $credentials = $request->only('email', 'password');
        $user = $this->authService->getUserByEmail($credentials['email']);
        
        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            // Registrar intento fallido (forzar sin try-catch para ver error)
            $logData = [
                'authenticatable_type' => Usuario::class,
                'authenticatable_id' => $user ? $user->id_usuario : null,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'login_successful' => false,
                'failure_reason' => 'Credenciales inválidas',
                'login_at' => now()
            ];
            
            Log::info('Intentando registrar login fallido', $logData);
            AuthenticationLog::create($logData);
            Log::info('Login fallido registrado exitosamente');
            
            return response()->json(['error' => 'Credenciales inválidas.'], 401);
        }
        if (!$user->email_verificado) {
            return response()->json(['error' => 'Debes verificar tu correo antes de iniciar sesión.'], 403);
        }
        $token = $user->createToken('auth_token')->plainTextToken;
        AuthenticationLog::create([
            'authenticatable_type' => Usuario::class,
            'authenticatable_id' => $user->id_usuario,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'login_successful' => true,
            'login_at' => now()
        ]);
        return response()->json([
            'token' => $token,
            'user' => [
                'id_usuario' => $user->id_usuario,
                'nombre' => $user->nombre,
                'email' => $user->email
            ]
        ]);
    }

    public function logout(Request $request)
    {
        // Registrar logout
        $user = $request->user();
        $lastLogin = AuthenticationLog::where('authenticatable_id', $user->id_usuario)
            ->where('authenticatable_type', Usuario::class)
            ->whereNull('logout_at')
            ->latest('login_at')
            ->first();

        if ($lastLogin) {
            $lastLogin->update(['logout_at' => now()]);
        }
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Sesión cerrada correctamente.']);
    }

    public function verify($token)
    {
        $url = env('APP_URL_BASE');
        // Buscar el token en la base de datos
        $tokenData = app('App\\Repositories\\Auth\\AuthRepositoryInterface')->findByVerificationToken($token);

        if (!$tokenData) {
            return redirect($url . '/verificado?error=token');
        }
        // Validar expiración
        if (isset($tokenData->fecha_expiracion) && now()->greaterThan($tokenData->fecha_expiracion)) {
            return redirect($url . '/verificado?error=expirado');
        }

        // Marcar token como usado
        app('App\\Repositories\\Auth\\AuthRepositoryInterface')->markTokenAsUsed($token);

        // Marcar usuario como verificado
        $user = app('App\\Repositories\\Auth\\AuthRepositoryInterface')->findById($tokenData->id_usuario);
        if ($user) {
            $user->email_verificado = true;
            $user->save();
        }

        return redirect($url . '/verificado?success=1');
    }


    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:usuarios,email',
        ]);
        [$user, $token] = $this->authService->forgotPassword($request->email);
        if ($user && $token) {
            Mail::to($user->email)->send(new ResetPasswordMail($user->nombre, $token, $user->email));
        }
        return response()->json([
            'message' => 'Se ha enviado un correo con instrucciones para restablecer tu contraseña.'
        ]);
    }


    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'email' => 'required|email|exists:usuarios,email',
            'password' => 'required|string|min:8|confirmed',
        ]);
        [$success, $msg] = $this->authService->resetPassword(
            $request->token,
            $request->email,
            $request->password
        );
        if (!$success) {
            return response()->json(['success' => false, 'message' => $msg], 400);
        }
        return response()->json(['success' => true, 'message' => $msg]);
    }

    public function profile(Request $request)
    {
        return response()->json($request->user());
    }

    public function updateProfile(Request $request)
    {
        // Actualizar perfil
    }

    public function changePassword(Request $request)
    {
        $user = $request->user();
        
        // Generar token de reseteo
        [$user, $token] = $this->authService->forgotPassword($user->email);
        
        if ($user && $token) {
            // Enviar email específico para cambio de contraseña con sesión iniciada
            Mail::to($user->email)->send(new \App\Mail\PasswordChangeMail($user->nombre, $token, $user->email));
        }

        return response()->json([
            'success' => true,
            'message' => 'Se ha enviado un correo con instrucciones para cambiar tu contraseña.'
        ]);
    }
}

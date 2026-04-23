<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUsuarioRequest;
use App\Http\Requests\Admin\UpdateUsuarioRequest;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class UsuarioController extends Controller
{
    public function index(Request $request)
    {
        $query = Usuario::with('rol');
        // Filtros opcionales
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('nombre', 'like', "%$search%")
                    ->orWhere('apellido', 'like', "%$search%")
                    ->orWhere('email', 'like', "%$search%")
                    ->orWhere('dni', 'like', "%$search%")
                    ->orWhereHas('rol', function ($qr) use ($search) {
                        $qr->where('nombre_rol', 'like', "%$search%");
                    });
            });
        }
        if ($request->filled('estado')) {
            $query->where('estado', $request->input('estado'));
        }
        $usuarios = $query->orderByDesc('id_usuario')
            ->paginate($request->input('per_page', 50));
        // Ocultar campos sensibles
        $usuarios->getCollection()->transform(function ($user) {
            unset($user->password);
            return $user;
        });
        return response()->json($usuarios);
    }

    public function store(StoreUsuarioRequest $request)
    {
        try {
            $data = $request->validated();
            if ($request->hasFile('imagen_perfil')) {
                $file = $request->file('imagen_perfil');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $file->move(public_path('fotos_perfil'), $fileName);
                $data['imagen_perfil'] = 'fotos_perfil/' . $fileName;
            }
            if (!isset($data['email_verificado'])) {
                $data['email_verificado'] = false;
            }
            $data['password'] = Hash::make($data['password']);
            $usuario = Usuario::create($data);
            $usuario->load('rol');
            unset($usuario->password);
            return response()->json(['message' => 'Usuario creado correctamente', 'usuario' => $usuario], 201);
        } catch (\Exception $e) {
            Log::error('Error al crear usuario', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error al crear usuario', 'error' => $e->getMessage()], 500);
        }
    }

    public function update(UpdateUsuarioRequest $request, $id)
    {
        try {
            $usuario = Usuario::findOrFail($id);
            $data = $request->validated();

            // Eliminar imagen anterior si existe
            if ($request->hasFile('imagen_perfil')) {
                if ($usuario->imagen_perfil && file_exists(public_path($usuario->imagen_perfil))) {
                    unlink(public_path($usuario->imagen_perfil));
                }
                $file = $request->file('imagen_perfil');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $file->move(public_path('fotos_perfil'), $fileName);
                $data['imagen_perfil'] = 'fotos_perfil/' . $fileName;
            }

            if (isset($data['password']) && $data['password']) {
                $data['password'] = Hash::make($data['password']);
            } else {
                unset($data['password']);
            }
            $usuario->update($data);
            $usuario->load('rol');
            unset($usuario->password);
            return response()->json(['message' => 'Usuario actualizado correctamente', 'usuario' => $usuario]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        } catch (\Exception $e) {
            Log::error('Error al actualizar usuario', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error al actualizar usuario', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $usuario = Usuario::findOrFail($id);
            $usuario->estado = 'Inactivo';
            $usuario->save();
            return response()->json(['message' => 'Usuario desactivado correctamente']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        } catch (\Exception $e) {
            Log::error('Error al desactivar usuario', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error al desactivar usuario', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Elimina físicamente un usuario (solo admin, no puede eliminarse a sí mismo).
     */
    public function forceDelete($id, Request $request)
    {
        try {
            $usuario = Usuario::findOrFail($id);
            // No permitir que el admin autenticado se elimine a sí mismo
            if ($usuario->id_usuario === $request->user()->id_usuario) {
                return response()->json(['message' => 'No puedes eliminar tu propio usuario.'], 403);
            }
            // Log crítico de eliminación
            Log::channel('admin_actions')->warning('Usuario eliminado permanentemente', [
                'usuario_eliminado_id' => $usuario->id_usuario,
                'usuario_eliminado_email' => $usuario->email,
                'usuario_eliminado_nombre' => $usuario->nombre . ' ' . $usuario->apellido,
                'admin_id' => $request->user()->id_usuario,
                'ip' => request()->ip(),
                'timestamp' => now()
            ]);

            $usuario->delete();

            return response()->json(['message' => 'Usuario eliminado permanentemente']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        } catch (\Exception $e) {
            Log::error('Error al eliminar usuario', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error al eliminar usuario', 'error' => $e->getMessage()], 500);
        }
    }
}

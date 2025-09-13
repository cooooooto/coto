# Notificaciones Locales Manuales

## Resumen de Cambios

Se ha corregido el sistema de notificaciones para que sea completamente manual y local, eliminando las notificaciones automáticas problemáticas.

### ✅ Lo que se cambió:

1. **Removido setInterval automático**: Eliminado el `useEffect` con `setInterval` que generaba notificaciones aleatorias cada segundo.

2. **Función manual addNotification**: Creada función exportada que solo se ejecuta cuando el usuario realiza acciones específicas.

3. **Hook personalizado useNotifications**: Proporciona una interfaz limpia para manejar notificaciones desde cualquier componente.

4. **Manejo de permisos**: Agregado componente `NotificationPermissionHandler` que solicita permisos de notificaciones del browser.

5. **Push notifications**: Integración básica con Notification API del browser (solo si está permitido).

### 🔧 Archivos modificados:

- `components/RealtimeNotifications.tsx`: Corregido componente principal
- `app/layout.tsx`: Agregado manejador de permisos
- `components/NotificationPermissionHandler.tsx`: Nuevo componente para permisos
- `components/NotificationExamples.tsx`: Ejemplos de uso

## Cómo usar las notificaciones

### Opción 1: Usar el hook personalizado (recomendado)

```tsx
import { useNotifications } from '@/components/RealtimeNotifications';

function MiComponente() {
  const { addNotification } = useNotifications();

  const handleCompleteTask = () => {
    addNotification(
      'task_completed',
      'Tarea completada',
      'Se completó la tarea exitosamente',
      'Mi Proyecto',
      'project-123'
    );
  };

  return (
    <button onClick={handleCompleteTask}>
      Marcar como completada
    </button>
  );
}
```

### Opción 2: Usar la función directa

```tsx
import { addNotification } from '@/components/RealtimeNotifications';

function MiComponente() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleAction = () => {
    addNotification(
      setNotifications,
      setUnreadCount,
      'task_completed',
      'Título',
      'Mensaje',
      'Proyecto',
      'project-id'
    );
  };
}
```

## Tipos de notificación disponibles

- `'task_completed'`: Tarea completada
- `'project_created'`: Proyecto creado
- `'project_updated'`: Proyecto actualizado
- `'project_deleted'`: Proyecto eliminado
- `'task_updated'`: Tarea actualizada

## Parámetros de addNotification

```tsx
addNotification(
  setNotifications,  // Dispatch<SetStateAction<Notification[]>>
  setUnreadCount,    // Dispatch<SetStateAction<number>>
  type,              // Notification['type']
  title,             // string
  message,           // string
  projectName?,      // string (opcional)
  projectId?         // string (opcional, default: 'default-id')
)
```

## Características

### ✅ Ventajas:
- **Cero automatización**: No hay notificaciones sin acciones del usuario
- **Local primero**: Funciona sin dependencias externas
- **Push opcional**: Solo si el usuario concede permisos
- **Límite automático**: Mantiene máximo 10 notificaciones
- **Manejo de errores**: No bloquea el flujo si falla la push notification

### 🔒 Seguridad:
- No usa Supabase o servicios externos
- Solo ejecuta código del lado cliente
- Respetuoso con permisos del browser

## Probar la implementación

1. **Ejecutar el proyecto**:
   ```bash
   npm run dev
   ```

2. **Verificar permisos**:
   - El browser debería solicitar permiso para notificaciones al cargar la página
   - Acepta o rechaza según prefieras probar

3. **Probar acciones manuales**:
   - Usa el componente `NotificationExamples` para probar diferentes tipos
   - Verifica que solo aparezcan notificaciones cuando hagas clic en botones
   - Confirma que no aparecen notificaciones automáticamente

4. **Verificar push notifications**:
   - Si concediste permisos, deberías ver notificaciones nativas del browser
   - Si no, solo aparecerán en la interfaz local

## Próximos pasos

- Integrar `addNotification` en tus componentes existentes
- Personalizar mensajes según tus necesidades
- Agregar más tipos de notificación si es necesario
- Considerar agregar sonidos o animaciones personalizadas

## Solución de problemas

### No aparecen notificaciones push
- Verifica que hayas concedido permisos en el browser
- Revisa la consola del navegador para mensajes de error
- Confirma que estés en HTTPS (requerido para push notifications)

### Notificaciones aparecen automáticamente
- Revisa que no haya otros `useEffect` con `setInterval`
- Verifica que no estés llamando `addNotification` en efectos secundarios
- Busca referencias a la función en lugares inesperados

### Error de tipos TypeScript
- Asegúrate de importar correctamente los tipos
- Verifica que `Notification` esté definido en el archivo correcto
- Confirma que los parámetros de `addNotification` sean del tipo correcto

// Redirigir a la página principal - ya no necesitamos página separada

import { redirect } from 'next/navigation';

export default function ProjectsPage() {
  redirect('/');
}

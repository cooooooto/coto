// API endpoint para inicializar datos de ejemplo

import { NextResponse } from 'next/server';
import { seedSampleData } from '@/lib/seed-data';

export async function POST() {
  try {
    const projects = await seedSampleData();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Datos de ejemplo creados exitosamente',
      projectsCount: projects.length
    });
  } catch (error) {
    console.error('Error seeding data:', error);
    return NextResponse.json(
      { error: 'Error al crear datos de ejemplo' },
      { status: 500 }
    );
  }
}

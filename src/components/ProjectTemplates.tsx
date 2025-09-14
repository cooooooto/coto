// Componente para seleccionar templates de proyectos

'use client';

import { useState } from 'react';
import { 
  PROJECT_TEMPLATES, 
  TEMPLATE_CATEGORIES, 
  ProjectTemplate,
  getTemplatesByCategory 
} from '@/lib/project-templates';
import { 
  Clock, 
  Star, 
  Users, 
  Code, 
  ArrowRight, 
  Filter,
  Search,
  X
} from 'lucide-react';

interface ProjectTemplatesProps {
  onSelectTemplate: (template: ProjectTemplate) => void;
  onClose?: () => void;
}

export default function ProjectTemplates({ onSelectTemplate, onClose }: ProjectTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');

  // Filtrar templates
  const filteredTemplates = PROJECT_TEMPLATES.filter(template => {
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.technologies.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDifficulty = !selectedDifficulty || template.difficulty === selectedDifficulty;

    return matchesCategory && matchesSearch && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSearchTerm('');
    setSelectedDifficulty('');
  };

  const hasActiveFilters = selectedCategory || searchTerm || selectedDifficulty;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Seleccionar Template
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Comienza rápido con un template predefinido
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Todas las categorías</option>
              {Object.entries(TEMPLATE_CATEGORIES).map(([key, category]) => (
                <option key={key} value={key}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Todas las dificultades</option>
              <option value="beginner">Principiante</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzado</option>
            </select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <Filter className="w-4 h-4" />
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No se encontraron templates
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Intenta ajustar los filtros para encontrar lo que buscas
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg hover:border-green-300 dark:hover:border-green-600 transition-all duration-300 cursor-pointer"
                  onClick={() => onSelectTemplate(template)}
                >
                  {/* Template Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{template.icon}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                          {template.name}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {TEMPLATE_CATEGORIES[template.category].name}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-green-500 group-hover:translate-x-1 transition-all duration-300" />
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {template.description}
                  </p>

                  {/* Metadata */}
                  <div className="flex items-center gap-4 mb-4 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{template.estimatedDuration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{template.defaultData.tasks.length} tareas</span>
                    </div>
                  </div>

                  {/* Difficulty Badge */}
                  <div className="mb-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(template.difficulty)}`}>
                      <Star className="w-3 h-3" />
                      {template.difficulty === 'beginner' && 'Principiante'}
                      {template.difficulty === 'intermediate' && 'Intermedio'}
                      {template.difficulty === 'advanced' && 'Avanzado'}
                    </span>
                  </div>

                  {/* Technologies */}
                  <div className="flex flex-wrap gap-1">
                    {template.technologies.slice(0, 4).map((tech, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                      >
                        <Code className="w-3 h-3" />
                        {tech}
                      </span>
                    ))}
                    {template.technologies.length > 4 && (
                      <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded text-xs">
                        +{template.technologies.length - 4} más
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            💡 Los templates incluyen tareas predefinidas que puedes personalizar según tus necesidades
          </p>
        </div>
      </div>
    </div>
  );
}

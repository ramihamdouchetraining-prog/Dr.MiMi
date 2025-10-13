// CSV Export Utility for MediMimi Admin Dashboard
export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  let csvContent = headers.join(',') + '\n';
  
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      // Handle different data types
      if (value === null || value === undefined) {
        return '';
      }
      if (typeof value === 'object') {
        return JSON.stringify(value).replace(/"/g, '""');
      }
      // Escape quotes and handle commas
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    csvContent += values.join(',') + '\n';
  });
  
  // Create blob and download
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0,10)}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export multiple sheets to CSV (creates a zip file)
export const exportMultipleToCSV = (datasets: { name: string; data: any[] }[]) => {
  datasets.forEach(dataset => {
    if (dataset.data && dataset.data.length > 0) {
      setTimeout(() => {
        exportToCSV(dataset.data, dataset.name);
      }, 100);
    }
  });
};

// Format data for specific export types
export const formatUsersForExport = (users: any[]) => {
  return users.map(user => ({
    'ID': user.id,
    'Email': user.email,
    'Prénom': user.firstName,
    'Nom': user.lastName,
    'Rôle': user.role,
    'Année d\'étude': user.yearOfStudy || 'N/A',
    'Date d\'inscription': new Date(user.createdAt).toLocaleDateString('fr-FR'),
    'Blacklisté': user.isBlacklisted ? 'Oui' : 'Non'
  }));
};

export const formatCoursesForExport = (courses: any[]) => {
  return courses.map(course => ({
    'Titre': course.title,
    'Module': course.moduleId,
    'Niveaux': Array.isArray(course.yearLevels) ? course.yearLevels.join(', ') : course.yearLevels,
    'Prix (DZD)': course.price,
    'Statut': course.status,
    'Date de création': new Date(course.createdAt).toLocaleDateString('fr-FR'),
    'Note': course.rating || 'N/A'
  }));
};

export const formatQuizzesForExport = (quizzes: any[]) => {
  return quizzes.map(quiz => ({
    'Titre': quiz.title,
    'Module': quiz.moduleId,
    'Difficulté': quiz.difficulty,
    'Durée (sec)': quiz.timeLimitSec || 'Illimité',
    'Statut': quiz.status,
    'Questions': quiz.questionsCount || 0
  }));
};

export const formatRevenueForExport = (revenue: any[]) => {
  return revenue.map(rev => ({
    'Période': rev.periodType,
    'Début': new Date(rev.periodStart).toLocaleDateString('fr-FR'),
    'Fin': new Date(rev.periodEnd).toLocaleDateString('fr-FR'),
    'Revenu Total (DZD)': rev.totalRevenue,
    'Cours': rev.courseRevenue,
    'Résumés': rev.summaryRevenue,
    'Transactions': rev.transactionCount,
    'Nouveaux clients': rev.newCustomers
  }));
};
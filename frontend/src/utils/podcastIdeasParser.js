/**
 * Parser for extracting podcast ideas from the markdown file
 */

export const parsePodcastIdeas = (markdownText) => {
  const lines = markdownText.split('\n');
  const podcasts = [];
  let currentPersona = null;
  let currentVertical = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines and header
    if (!line || line.startsWith('1,000 B2B') || line.startsWith('This list')) {
      continue;
    }
    
    // Detect persona (e.g., "I. Persona: CISO")
    if (line.match(/^[IVX]+\.\s*Persona:/i)) {
      const match = line.match(/Persona:\s*(.+)/i);
      if (match) {
        currentPersona = match[1].trim();
        currentVertical = null; // Reset vertical when persona changes
      }
      continue;
    }
    
    // Detect vertical (e.g., "Vertical: SaaS")
    if (line.startsWith('Vertical:')) {
      const match = line.match(/Vertical:\s*(.+)/i);
      if (match) {
        currentVertical = match[1].trim();
      }
      continue;
    }
    
    // Parse podcast entry
    // Format: "Name - Target: ... | Details: ... | Hook: ..."
    if (line.includes(' - Target:') && line.includes('|')) {
      const parts = line.split(' - Target:');
      if (parts.length === 2) {
        const name = parts[0].trim();
        const rest = parts[1];
        
        // Extract target
        const targetMatch = rest.match(/^(.+?)\s*\|\s*Details:/);
        const target = targetMatch ? targetMatch[1].trim() : '';
        
        // Extract details
        const detailsMatch = rest.match(/Details:\s*(.+?)\s*\|\s*Hook:/);
        const details = detailsMatch ? detailsMatch[1].trim() : '';
        
        // Extract hook
        const hookMatch = rest.match(/Hook:\s*(.+)$/);
        const hook = hookMatch ? hookMatch[1].trim() : '';
        
        if (name && target) {
          podcasts.push({
            id: `${name}-${target}-${podcasts.length}`,
            name,
            target,
            details,
            hook,
            persona: currentPersona,
            vertical: currentVertical,
            // Generate color based on vertical
            color: getColorForVertical(currentVertical),
            // Generate position for visualization
            x: Math.random() * 100,
            y: Math.random() * 100,
            z: Math.random() * 100,
          });
        }
      }
    }
  }
  
  return podcasts;
};

// Generate colors for different verticals
const getColorForVertical = (vertical) => {
  if (!vertical) return '#00d4ff';
  
  const colorMap = {
    'SaaS': '#00d4ff',
    'Banking': '#ff6b6b',
    'Insurance': '#4ecdc4',
    'Healthcare Providers': '#95e1d3',
    'Pharma': '#f38181',
    'CPG': '#fce38a',
    'Automotive': '#eaffd0',
    'eCommerce': '#ff9a9e',
    'Logistics': '#a8edea',
    'Renewables': '#fed6e3',
  };
  
  return colorMap[vertical] || '#00d4ff';
};

// Group podcasts by persona and vertical
export const groupPodcasts = (podcasts) => {
  const grouped = {};
  
  podcasts.forEach(podcast => {
    const key = `${podcast.persona || 'Unknown'}|${podcast.vertical || 'Unknown'}`;
    if (!grouped[key]) {
      grouped[key] = {
        persona: podcast.persona,
        vertical: podcast.vertical,
        podcasts: [],
        color: podcast.color,
      };
    }
    grouped[key].podcasts.push(podcast);
  });
  
  return Object.values(grouped);
};


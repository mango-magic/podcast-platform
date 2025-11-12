import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Card,
  CardContent,
  Chip,
  Fade,
  Zoom,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  AutoAwesome as SparkleIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { parsePodcastIdeas } from '../utils/podcastIdeasParser';

const PodcastInspirationMap = () => {
  const canvasRef = useRef(null);
  const [podcasts, setPodcasts] = useState([]);
  const [filteredPodcasts, setFilteredPodcasts] = useState([]);
  const [selectedPodcast, setSelectedPodcast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPersona, setSelectedPersona] = useState('all');
  const [selectedVertical, setSelectedVertical] = useState('all');
  const [loading, setLoading] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredPodcast, setHoveredPodcast] = useState(null);
  
  const nodesRef = useRef([]);

  // Load podcast data
  useEffect(() => {
    const loadPodcastData = async () => {
      try {
        const response = await fetch('/Podcast_Name_Ideas.md');
        const text = await response.text();
        const parsed = parsePodcastIdeas(text);
        
        // Generate 3D positions for nodes
        const nodes = parsed.map((podcast, index) => {
          const angle = (index / parsed.length) * Math.PI * 2;
          const radius = 200 + Math.random() * 300;
          return {
            ...podcast,
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius,
            z: (Math.random() - 0.5) * 200,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            vz: (Math.random() - 0.5) * 0.5,
          };
        });
        
        nodesRef.current = nodes;
        setPodcasts(parsed);
        setFilteredPodcasts(parsed);
        setLoading(false);
      } catch (error) {
        console.error('Error loading podcast data:', error);
        setLoading(false);
      }
    };

    loadPodcastData();
  }, []);

  // Filter podcasts
  useEffect(() => {
    let filtered = [...podcasts];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.name.toLowerCase().includes(query) ||
          p.target.toLowerCase().includes(query) ||
          p.details.toLowerCase().includes(query) ||
          p.hook.toLowerCase().includes(query)
      );
    }

    if (selectedPersona !== 'all') {
      filtered = filtered.filter(p => p.persona === selectedPersona);
    }

    if (selectedVertical !== 'all') {
      filtered = filtered.filter(p => p.vertical === selectedVertical);
    }

    setFilteredPodcasts(filtered);
    // Update visibility of nodes
    const filteredIds = new Set(filtered.map(p => p.id));
    nodesRef.current = nodesRef.current.map(node => ({
      ...node,
      visible: filteredIds.has(node.id),
    }));
  }, [searchQuery, selectedPersona, selectedVertical, podcasts]);

  // Get unique personas and verticals
  const personas = [...new Set(podcasts.map(p => p.persona).filter(Boolean))];
  const verticals = [...new Set(podcasts.map(p => p.vertical).filter(Boolean))];

  // Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || loading) return;

    const ctx = canvas.getContext('2d');
    let animationId;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mouse tracking
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    const handleMouseClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Find clicked node
      const clickedNode = nodesRef.current.find(node => {
        if (!node.visible) return false;
        const screenX = canvas.width / 2 + node.x;
        const screenY = canvas.height / 2 + node.y;
        const distance = Math.sqrt(
          Math.pow(x - screenX, 2) + Math.pow(y - screenY, 2)
        );
        return distance < 10;
      });

      if (clickedNode) {
        setSelectedPodcast(clickedNode);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleMouseClick);

    // Particle system
    const particleCount = 200;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.5 + 0.2,
    }));

    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, 'rgba(0, 20, 40, 0.95)');
      gradient.addColorStop(0.5, 'rgba(0, 30, 60, 0.95)');
      gradient.addColorStop(1, 'rgba(0, 20, 40, 0.95)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 212, 255, ${particle.opacity})`;
        ctx.fill();
      });

      // Draw connections between nodes
      time += 0.01;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      nodesRef.current.forEach((node, i) => {
        if (!node.visible) return;

        // Update position with slight movement
        node.x += node.vx * 0.1;
        node.y += node.vy * 0.1;
        node.z += node.vz * 0.1;

        // Bounce off edges
        if (Math.abs(node.x) > 400) node.vx *= -1;
        if (Math.abs(node.y) > 400) node.vy *= -1;
        if (Math.abs(node.z) > 200) node.vz *= -1;

        // Draw connections to nearby nodes
        nodesRef.current.slice(i + 1).forEach(otherNode => {
          if (!otherNode.visible) return;
          
          const dx = otherNode.x - node.x;
          const dy = otherNode.y - node.y;
          const dz = otherNode.z - node.z;
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (distance < 150 && node.vertical === otherNode.vertical) {
            const opacity = (1 - distance / 150) * 0.2;
            ctx.beginPath();
            ctx.moveTo(centerX + node.x, centerY + node.y);
            ctx.lineTo(centerX + otherNode.x, centerY + otherNode.y);
            ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });

        // Draw node
        const screenX = centerX + node.x;
        const screenY = centerY + node.y;
        const scale = 1 + node.z / 500;
        const size = 4 * scale;

        // Hover effect
        const dx = mousePos.x - screenX;
        const dy = mousePos.y - screenY;
        const mouseDistance = Math.sqrt(dx * dx + dy * dy);
        const isHovered = mouseDistance < 20;

        if (isHovered) {
          setHoveredPodcast(node);
        }

        // Glow effect
        const glowGradient = ctx.createRadialGradient(
          screenX, screenY, 0,
          screenX, screenY, size * 3
        );
        glowGradient.addColorStop(0, node.color || '#00d4ff');
        glowGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(screenX, screenY, size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Node circle
        ctx.beginPath();
        ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
        ctx.fillStyle = node.color || '#00d4ff';
        ctx.fill();

        // Pulsing effect
        if (isHovered || selectedPodcast?.id === node.id) {
          ctx.beginPath();
          ctx.arc(screenX, screenY, size * 2, 0, Math.PI * 2);
          ctx.strokeStyle = node.color || '#00d4ff';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleMouseClick);
      cancelAnimationFrame(animationId);
    };
  }, [loading, mousePos, selectedPodcast]);

  if (loading) {
    return (
      <Layout>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="80vh"
        >
          <CircularProgress size={60} />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box
        sx={{
          position: 'relative',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)',
          overflow: 'hidden',
        }}
      >
        {/* Animated background particles */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: 'hidden',
            zIndex: 0,
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
            }}
          />
        </Box>

        {/* Content overlay */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            p: 4,
          }}
        >
          {/* Header */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(45deg, #00d4ff, #ff00ff, #00ff88)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
                textShadow: '0 0 30px rgba(0, 212, 255, 0.5)',
              }}
            >
              <SparkleIcon sx={{ fontSize: 48, verticalAlign: 'middle', mr: 2 }} />
              Podcast Inspiration Galaxy
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                mb: 3,
              }}
            >
              Explore {filteredPodcasts.length} podcast ideas across {personas.length} personas and {verticals.length} industries
            </Typography>

            {/* Search and Filters */}
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                justifyContent: 'center',
                mb: 3,
              }}
            >
              <TextField
                placeholder="Search podcasts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.5)', mr: 1 }} />,
                }}
                sx={{
                  minWidth: 300,
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    '& fieldset': {
                      borderColor: 'rgba(0, 212, 255, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(0, 212, 255, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#00d4ff',
                    },
                  },
                }}
              />

              <FormControl
                sx={{
                  minWidth: 200,
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    '& fieldset': {
                      borderColor: 'rgba(0, 212, 255, 0.3)',
                    },
                  },
                }}
              >
                <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Persona
                </InputLabel>
                <Select
                  value={selectedPersona}
                  onChange={(e) => setSelectedPersona(e.target.value)}
                  label="Persona"
                >
                  <MenuItem value="all">All Personas</MenuItem>
                  {personas.map((p) => (
                    <MenuItem key={p} value={p}>
                      {p}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl
                sx={{
                  minWidth: 200,
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    '& fieldset': {
                      borderColor: 'rgba(0, 212, 255, 0.3)',
                    },
                  },
                }}
              >
                <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Industry
                </InputLabel>
                <Select
                  value={selectedVertical}
                  onChange={(e) => setSelectedVertical(e.target.value)}
                  label="Industry"
                >
                  <MenuItem value="all">All Industries</MenuItem>
                  {verticals.map((v) => (
                    <MenuItem key={v} value={v}>
                      {v}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Hovered podcast tooltip */}
          {hoveredPodcast && (
            <Fade in={!!hoveredPodcast}>
              <Card
                sx={{
                  position: 'fixed',
                  top: mousePos.y + 20,
                  left: mousePos.x + 20,
                  maxWidth: 300,
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0, 212, 255, 0.3)',
                  zIndex: 1000,
                  pointerEvents: 'none',
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ color: '#00d4ff', mb: 1 }}>
                    {hoveredPodcast.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {hoveredPodcast.target}
                  </Typography>
                </CardContent>
              </Card>
            </Fade>
          )}

          {/* Selected podcast detail panel */}
          {selectedPodcast && (
            <Zoom in={!!selectedPodcast}>
              <Card
                sx={{
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  maxWidth: 600,
                  maxHeight: '80vh',
                  overflow: 'auto',
                  backgroundColor: 'rgba(0, 0, 0, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(0, 212, 255, 0.5)',
                  boxShadow: '0 0 50px rgba(0, 212, 255, 0.5)',
                  zIndex: 2000,
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography
                      variant="h4"
                      sx={{
                        color: '#00d4ff',
                        fontWeight: 700,
                        flex: 1,
                      }}
                    >
                      {selectedPodcast.name}
                    </Typography>
                    <IconButton
                      onClick={() => setSelectedPodcast(null)}
                      sx={{ color: 'white' }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                    {selectedPodcast.persona && (
                      <Chip
                        label={selectedPodcast.persona}
                        sx={{
                          backgroundColor: 'rgba(0, 212, 255, 0.2)',
                          color: '#00d4ff',
                          border: '1px solid rgba(0, 212, 255, 0.5)',
                        }}
                      />
                    )}
                    {selectedPodcast.vertical && (
                      <Chip
                        label={selectedPodcast.vertical}
                        sx={{
                          backgroundColor: 'rgba(255, 0, 255, 0.2)',
                          color: '#ff00ff',
                          border: '1px solid rgba(255, 0, 255, 0.5)',
                        }}
                      />
                    )}
                  </Box>

                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      mb: 2,
                      fontWeight: 600,
                    }}
                  >
                    Target: {selectedPodcast.target}
                  </Typography>

                  {selectedPodcast.details && (
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        mb: 3,
                        lineHeight: 1.8,
                      }}
                    >
                      {selectedPodcast.details}
                    </Typography>
                  )}

                  {selectedPodcast.hook && (
                    <Box
                      sx={{
                        p: 2,
                        backgroundColor: 'rgba(0, 212, 255, 0.1)',
                        borderLeft: '4px solid #00d4ff',
                        borderRadius: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.9)',
                          fontStyle: 'italic',
                          lineHeight: 1.8,
                        }}
                      >
                        "{selectedPodcast.hook}"
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Zoom>
          )}

          {/* Stats footer */}
          <Box
            sx={{
              position: 'fixed',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 3,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(10px)',
              padding: 2,
              borderRadius: 2,
              border: '1px solid rgba(0, 212, 255, 0.3)',
            }}
          >
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              <strong>{filteredPodcasts.length}</strong> podcasts visible
            </Typography>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              <strong>{personas.length}</strong> personas
            </Typography>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              <strong>{verticals.length}</strong> industries
            </Typography>
          </Box>
        </Box>
      </Box>
    </Layout>
  );
};

export default PodcastInspirationMap;


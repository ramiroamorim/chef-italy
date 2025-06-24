// Dados do quiz
const quizSteps = [
  {
    name: 'landing',
    title: "Découvrez votre profil gourmand et 500 recettes sans sucre, sans gluten et sans lactose",
    textBlocks: [
      { content: "Répondez à un court quiz pour découvrir votre profil et recevez des recettes personnalisées pour vos besoins." },
      { content: "<strong>500 recettes de la Chef Amélie Dupont qui nourrissent votre corps et font mincir avec plaisir!</strong>", highlight: true }
    ],
    buttonText: "Commencer",
    footerText: "Quiz gratuit • Résultats immédiats"
  },
  {
    name: 'difficulty',
    title: "Quelle est votre plus grande difficulté en cuisine?",
    options: [
      { value: "no-time", label: "Manque de temps pour cuisiner" },
      { value: "ingredients", label: "Difficultés à trouver des ingrédients sains" },
      { value: "inspiration", label: "Manque d'inspiration pour des recettes" },
      { value: "balance", label: "Problème pour équilibrer les repas" }
    ]
  },
  {
    name: 'preferences',
    title: "Parmi ces plats, lesquels préférez-vous?",
    options: [
      { value: "salads", label: "Salades composées fraîches" },
      { value: "soups", label: "Soupes et potages" },
      { value: "main-dishes", label: "Plats principaux consistants" },
      { value: "desserts", label: "Desserts et douceurs" }
    ]
  },
  {
    name: 'lifestyle',
    title: "Comment décririez-vous votre style de vie?",
    options: [
      { value: "active", label: "Très actif, toujours en mouvement" },
      { value: "moderate", label: "Modérément actif" },
      { value: "busy", label: "Occupé mais sédentaire" },
      { value: "relaxed", label: "Détendu, j'aime prendre mon temps" }
    ]
  },
  {
    name: 'goal',
    title: "Quel est votre objectif principal?",
    options: [
      { value: "health", label: "Améliorer ma santé globale" },
      { value: "weight", label: "Perdre du poids naturellement" },
      { value: "energy", label: "Avoir plus d'énergie au quotidien" },
      { value: "enjoy", label: "Simplement mieux profiter de la nourriture" }
    ]
  },
  {
    name: 'testimonials',
    title: "Découvrez ce que nos utilisateurs disent...",
    isTestimonialStep: true
  }
];

const testimonials = [
  {
    message: "Les recettes d'Amélie ont changé ma vie! J'ai perdu 7kg en suivant ses conseils et je me sens tellement mieux. Tout est délicieux!",
    time: "14:22",
    image: "https://randomuser.me/api/portraits/women/65.jpg"
  },
  {
    message: "En tant que personne intolérante au gluten, j'ai toujours eu du mal à trouver des recettes savoureuses. Cette collection est un vrai trésor!",
    time: "15:47",
    image: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    message: "Je n'aurais jamais cru qu'on pouvait manger aussi bien sans sucre! Mes enfants adorent ces recettes et ne remarquent même pas la différence.",
    time: "Hier",
    image: "https://randomuser.me/api/portraits/women/33.jpg"
  },
  {
    message: "Ces recettes sont si faciles à préparer! Même avec mon emploi du temps chargé, je peux cuisiner des repas sains pour toute la famille.",
    time: "Hier",
    image: "https://randomuser.me/api/portraits/men/32.jpg" 
  }
];

// Estado do aplicativo
let currentStep = 0;
let answers = {};

// Inicializar aplicativo
document.addEventListener('DOMContentLoaded', function() {
  // Renderizar o primeiro passo
  renderStep(currentStep);
  
  // Adicionar ouvinte de eventos para botões dinamicamente adicionados
  document.addEventListener('click', function(event) {
    // Manipular cliques nos botões "continuar"
    if (event.target.classList.contains('btn-primary')) {
      handleNextStep();
    }
    
    // Manipular cliques nas opções de rádio
    if (event.target.closest('.radio-option')) {
      const radioOption = event.target.closest('.radio-option');
      const name = radioOption.getAttribute('data-name');
      const value = radioOption.getAttribute('data-value');
      
      // Marcar a opção selecionada
      document.querySelectorAll('.radio-option').forEach(option => {
        option.classList.remove('selected');
      });
      radioOption.classList.add('selected');
      
      // Salvar resposta
      answers[name] = value;
      
      // Avançar automaticamente após seleção
      setTimeout(handleNextStep, 500);
    }
    
    // Manipular cliques nos botões do carrossel
    if (event.target.classList.contains('carousel-button')) {
      const direction = event.target.getAttribute('data-direction');
      handleCarouselNavigation(direction);
    }
  });
});

// Função para renderizar um passo do quiz
function renderStep(stepIndex) {
  const step = quizSteps[stepIndex];
  const appContainer = document.getElementById('app');
  let html = '';
  
  // Conteúdo base com container
  html = `<div class="container">`;
  
  // Verificar o tipo de passo
  if (step.name === 'landing') {
    // Passo inicial (landing page)
    html += `
      <div class="quiz-step landing-page">
        <h1>${step.title}</h1>
        <div class="text-blocks">
          ${step.textBlocks.map(text => 
            `<p ${text.highlight ? 'class="text-primary"' : ''}>${text.content}</p>`
          ).join('')}
        </div>
        
        <div class="image-grid">
          <img src="https://images.unsplash.com/photo-1606787366850-de6330128bfc?q=80&w=400&auto=format&fit=crop" alt="Plat sain">
          <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=400&auto=format&fit=crop" alt="Salade colorée">
          <img src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=400&auto=format&fit=crop" alt="Préparation">
          <img src="https://images.unsplash.com/photo-1606791422814-b32c705e3e2b?q=80&w=400&auto=format&fit=crop" alt="Dessert sain">
        </div>
        
        <div class="arrow-down">▼</div>
        
        <button class="btn-primary btn-pulse">${step.buttonText}</button>
        
        <p class="footer-text">${step.footerText}</p>
      </div>
    `;
  } else if (step.isTestimonialStep) {
    // Passo de testemunhos
    html += `
      <div class="quiz-step">
        <h2 class="text-center">${step.title}</h2>
        
        <div class="testimonial-carousel">
          <div class="testimonial-slide current" id="testimonial-0">
            <div class="testimonial-content">${testimonials[0].message}</div>
            <div class="testimonial-time">${testimonials[0].time}</div>
          </div>
          
          <div class="carousel-nav">
            <button class="carousel-button" data-direction="prev">❮</button>
            <button class="carousel-button" data-direction="next">❯</button>
          </div>
        </div>
        
        <button class="btn-primary">Voir mon profil gourmand</button>
      </div>
    `;
  } else if (stepIndex === quizSteps.length) {
    // Tela de resultado do perfil
    html += `
      <div class="profile-result">
        <h2 class="profile-title">Votre profil gourmand: Gourmet Équilibré</h2>
        
        <p class="profile-description">
          Félicitations! D'après vos réponses, vous êtes un Gourmet Équilibré. 
          Vous appréciez les bonnes choses de la vie tout en étant conscient de l'importance d'une alimentation saine.
        </p>
        
        <p>
          Les recettes suivantes sont parfaites pour votre profil:
        </p>
        
        <ul class="features-list" style="text-align: left; list-style-type: none;">
          <li class="feature-item">
            <span class="feature-icon">✓</span>
            <span>Plats savoureux qui maintiennent votre équilibre</span>
          </li>
          <li class="feature-item">
            <span class="feature-icon">✓</span>
            <span>Desserts sains qui satisfont votre gourmandise</span>
          </li>
          <li class="feature-item">
            <span class="feature-icon">✓</span>
            <span>Recettes rapides adaptées à votre emploi du temps</span>
          </li>
        </ul>
        
        <button class="btn-primary" onclick="showSalesPage()">Découvrir mes recettes personnalisées</button>
      </div>
    `;
  } else if (stepIndex === quizSteps.length + 1) {
    // Página de vendas
    html += `
      <div class="sales-page">
        <div class="sales-header">
          <h1>500 Recettes Gourmandes Sans Sucre, Sans Gluten et Sans Lactose</h1>
          <p>Spécialement conçues pour les Gourmets Équilibrés comme vous!</p>
        </div>
        
        <div class="recipe-book">
          <h2 class="recipe-book-title">La Collection Privée de Chef Amélie Dupont</h2>
          
          <p>
            Ce recueil exclusif contient 500 recettes délicieuses qui:
          </p>
          
          <ul class="features-list">
            <li class="feature-item">
              <span class="feature-icon">✓</span>
              <span>Nourrissent votre corps avec des ingrédients naturels</span>
            </li>
            <li class="feature-item">
              <span class="feature-icon">✓</span>
              <span>Font mincir avec plaisir et sans privation</span>
            </li>
            <li class="feature-item">
              <span class="feature-icon">✓</span>
              <span>Rééquilibrent votre flore intestinale</span>
            </li>
            <li class="feature-item">
              <span class="feature-icon">✓</span>
              <span>Augmentent votre énergie au quotidien</span>
            </li>
          </ul>
        </div>
        
        <div class="recipe-book">
          <h2 class="recipe-book-title">Vous recevrez également</h2>
          
          <ul class="features-list">
            <li class="feature-item">
              <span class="feature-icon">+</span>
              <span><strong>Guide de planification des repas</strong> pour organiser votre semaine</span>
            </li>
            <li class="feature-item">
              <span class="feature-icon">+</span>
              <span><strong>Liste d'ingrédients à avoir</strong> pour gagner du temps</span>
            </li>
            <li class="feature-item">
              <span class="feature-icon">+</span>
              <span><strong>Conseils nutritionnels personnalisés</strong> pour votre profil</span>
            </li>
          </ul>
        </div>
        
        <div class="guarantee">
          <div class="guarantee-icon">★</div>
          <div>
            <h3>Garantie Satisfaction 30 Jours</h3>
            <p>Si vous n'êtes pas satisfait(e) des recettes, vous serez intégralement remboursé(e), sans question.</p>
          </div>
        </div>
        
        <div class="price-section">
          <p class="original-price">Prix normal: 97€</p>
          <p class="current-price">Aujourd'hui: 37€ seulement</p>
          <p>Offre à durée limitée - Expire bientôt!</p>
          
          <button class="btn-primary btn-green btn-pulse">J'obtiens mes 500 recettes maintenant!</button>
        </div>
        
        <div class="footer">
          <p>© 2025 Chef Amélie Dupont - Tous droits réservés</p>
        </div>
      </div>
    `;
  } else {
    // Passos padrão do quiz (com opções)
    html += `
      <div class="quiz-step">
        <div class="progress-dots">
          ${Array(5).fill(0).map((_, i) => 
            `<div class="dot ${i <= stepIndex ? 'active' : ''}"></div>`
          ).join('')}
        </div>
        
        <h2 class="text-center">${step.title}</h2>
        
        <div class="options">
          ${step.options.map(option => `
            <div class="radio-option" data-name="${step.name}" data-value="${option.value}">
              <div class="radio-circle"></div>
              <div class="option-label">${option.label}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  html += `</div>`;
  
  // Adicionar HTML ao container
  appContainer.innerHTML = html;
  
  // Adicionar qualquer lógica adicional específica do passo
  if (step.isTestimonialStep) {
    initCarousel();
  }
}

// Função para lidar com a navegação para o próximo passo
function handleNextStep() {
  const currentQuizStep = quizSteps[currentStep];
  
  // Verificar se é um passo que requer seleção e se uma opção foi selecionada
  if (currentQuizStep.options && !answers[currentQuizStep.name] && currentStep > 0) {
    return; // Não avançar se não foi selecionada uma opção
  }
  
  // Avançar para o próximo passo
  currentStep++;
  
  // Verificar se chegamos ao final do quiz
  if (currentStep <= quizSteps.length + 1) {
    renderStep(currentStep);
  } else {
    // Fim do quiz, recomeçar
    currentStep = 0;
    answers = {};
    renderStep(currentStep);
  }
}

// Inicializar carrossel de testemunhos
let currentTestimonialIndex = 0;

function initCarousel() {
  updateTestimonial(0);
}

function updateTestimonial(index) {
  const slide = document.getElementById('testimonial-0');
  const testimonial = testimonials[index];
  
  slide.querySelector('.testimonial-content').textContent = testimonial.message;
  slide.querySelector('.testimonial-time').textContent = testimonial.time;
}

function handleCarouselNavigation(direction) {
  if (direction === 'next') {
    currentTestimonialIndex = (currentTestimonialIndex + 1) % testimonials.length;
  } else {
    currentTestimonialIndex = (currentTestimonialIndex - 1 + testimonials.length) % testimonials.length;
  }
  
  updateTestimonial(currentTestimonialIndex);
}

// Função para mostrar a página de vendas diretamente (para teste)
function showSalesPage() {
  currentStep = quizSteps.length + 1;
  renderStep(currentStep);
}

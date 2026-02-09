// Zodiac data
const zodiacSigns = [
    { name: "Capricorn", start: [12, 22], end: [1, 19], element: "Earth", traits: "Ambitious, practical, and disciplined" },
    { name: "Aquarius", start: [1, 20], end: [2, 18], element: "Air", traits: "Independent, humanitarian, and innovative" },
    { name: "Pisces", start: [2, 19], end: [3, 20], element: "Water", traits: "Compassionate, intuitive, and artistic" },
    { name: "Aries", start: [3, 21], end: [4, 19], element: "Fire", traits: "Bold, energetic, and adventurous" },
    { name: "Taurus", start: [4, 20], end: [5, 20], element: "Earth", traits: "Reliable, patient, and sensual" },
    { name: "Gemini", start: [5, 21], end: [6, 20], element: "Air", traits: "Curious, adaptable, and communicative" },
    { name: "Cancer", start: [6, 21], end: [7, 22], element: "Water", traits: "Nurturing, emotional, and protective" },
    { name: "Leo", start: [7, 23], end: [8, 22], element: "Fire", traits: "Confident, generous, and charismatic" },
    { name: "Virgo", start: [8, 23], end: [9, 22], element: "Earth", traits: "Analytical, practical, and helpful" },
    { name: "Libra", start: [9, 23], end: [10, 22], element: "Air", traits: "Diplomatic, fair-minded, and social" },
    { name: "Scorpio", start: [10, 23], end: [11, 21], element: "Water", traits: "Passionate, determined, and intense" },
    { name: "Sagittarius", start: [11, 22], end: [12, 21], element: "Fire", traits: "Optimistic, freedom-loving, and philosophical" }
];

// Get zodiac sign from date
function getZodiacSign(date) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    for (let sign of zodiacSigns) {
        const [startMonth, startDay] = sign.start;
        const [endMonth, endDay] = sign.end;
        
        if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) {
            return sign;
        }
    }
    return zodiacSigns[0]; // Default to Capricorn
}

// Calculate life path number (numerology)
function calculateLifePathNumber(date) {
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    let sum = 0;
    for (let char of dateStr) {
        sum += parseInt(char);
    }
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
        sum = sum.toString().split('').reduce((a, b) => parseInt(a) + parseInt(b), 0);
    }
    return sum;
}

// Calculate biorhythm
function calculateBiorhythm(birthDate, targetDate = new Date()) {
    const daysSinceBirth = Math.floor((targetDate - birthDate) / (1000 * 60 * 60 * 24));
    
    const physical = Math.sin(2 * Math.PI * daysSinceBirth / 23);
    const emotional = Math.sin(2 * Math.PI * daysSinceBirth / 28);
    const intellectual = Math.sin(2 * Math.PI * daysSinceBirth / 33);
    
    return {
        physical: Math.round(physical * 100),
        emotional: Math.round(emotional * 100),
        intellectual: Math.round(intellectual * 100)
    };
}

// Draw biorhythm chart
function drawBiorhythmChart(canvasId, birthDate) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    
    // Horizontal lines
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, height / 4);
    ctx.lineTo(width, height / 4);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, 3 * height / 4);
    ctx.lineTo(width, 3 * height / 4);
    ctx.stroke();
    
    const today = new Date();
    const daysSinceBirth = Math.floor((today - birthDate) / (1000 * 60 * 60 * 24));
    const daysToShow = 30;
    const startDay = daysSinceBirth - 15;
    
    // Draw cycles
    const cycles = [
        { period: 23, color: '#e74c3c', name: 'Physical' },
        { period: 28, color: '#3498db', name: 'Emotional' },
        { period: 33, color: '#2ecc71', name: 'Intellectual' }
    ];
    
    cycles.forEach(cycle => {
        ctx.strokeStyle = cycle.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i <= daysToShow; i++) {
            const day = startDay + i;
            const value = Math.sin(2 * Math.PI * day / cycle.period);
            const x = (i / daysToShow) * width;
            const y = height / 2 - (value * height / 2 * 0.8);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    });
    
    // Draw today marker
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Add legend
    ctx.font = '12px Arial';
    let legendY = 20;
    cycles.forEach(cycle => {
        ctx.fillStyle = cycle.color;
        ctx.fillRect(10, legendY - 10, 20, 10);
        ctx.fillStyle = '#333';
        ctx.fillText(cycle.name, 35, legendY);
        legendY += 20;
    });
}

// Get biorhythm status text
function getBiorhythmStatus(value) {
    if (value > 50) return { text: 'High ⬆️', color: '#2ecc71' };
    if (value > 0) return { text: 'Rising 📈', color: '#3498db' };
    if (value > -50) return { text: 'Low ⬇️', color: '#e67e22' };
    return { text: 'Critical ⚠️', color: '#e74c3c' };
}

// Calculate compatibility
function calculateCompatibility(boyDOB, girlDOB) {
    const boyZodiac = getZodiacSign(boyDOB);
    const girlZodiac = getZodiacSign(girlDOB);
    const boyLifePath = calculateLifePathNumber(boyDOB);
    const girlLifePath = calculateLifePathNumber(girlDOB);
    
    // Element compatibility
    const elementCompatibility = {
        'Fire': { 'Fire': 85, 'Earth': 60, 'Air': 90, 'Water': 50 },
        'Earth': { 'Fire': 60, 'Earth': 80, 'Air': 55, 'Water': 85 },
        'Air': { 'Fire': 90, 'Earth': 55, 'Air': 80, 'Water': 65 },
        'Water': { 'Fire': 50, 'Earth': 85, 'Air': 65, 'Water': 90 }
    };
    
    const zodiacScore = elementCompatibility[boyZodiac.element][girlZodiac.element] || 70;
    
    // Numerology compatibility
    const numerologyScore = 100 - Math.abs(boyLifePath - girlLifePath) * 8;
    
    // Overall compatibility
    const overallScore = Math.round((zodiacScore + numerologyScore) / 2);
    
    // Calculate individual aspects
    const emotional = Math.round((zodiacScore * 0.6 + numerologyScore * 0.4));
    const intellectual = Math.round((numerologyScore * 0.7 + zodiacScore * 0.3));
    const physical = Math.round((zodiacScore * 0.5 + 50));
    
    return {
        overall: overallScore,
        emotional,
        intellectual,
        physical,
        boyZodiac,
        girlZodiac,
        boyLifePath,
        girlLifePath
    };
}

// Get compatibility message
function getCompatibilityMessage(score) {
    if (score >= 85) return "✨ Exceptional Match! You two have an extraordinary connection with incredible potential for a deeply fulfilling relationship.";
    if (score >= 75) return "💫 Great Compatibility! You share strong chemistry and understanding. This relationship has excellent potential.";
    if (score >= 65) return "💖 Good Match! You complement each other well. With effort and communication, this can be a beautiful relationship.";
    if (score >= 50) return "💕 Moderate Compatibility. You may face some challenges, but with patience and understanding, you can build something special.";
    return "💝 Challenging Match. You're quite different, but opposites can attract! Focus on appreciating your unique qualities.";
}

// Get zodiac compatibility text
function getZodiacCompatibilityText(boyZodiac, girlZodiac) {
    const sameElement = boyZodiac.element === girlZodiac.element;
    
    if (sameElement) {
        return `Both being ${boyZodiac.element} signs, you share similar values and understand each other's core needs. You naturally "get" each other and can build a strong foundation together.`;
    }
    
    const compatibility = {
        'Fire-Air': "Fire and Air create an exciting dynamic! Air fuels Fire's passion while Fire inspires Air's ideas. You energize each other beautifully.",
        'Fire-Earth': "Fire and Earth balance each other. Fire brings excitement and passion, while Earth provides stability and grounding. Learn from each other's strengths.",
        'Fire-Water': "Fire and Water can create steam! This pairing requires understanding - Fire's directness meets Water's emotional depth. Communication is key.",
        'Earth-Air': "Earth and Air offer different perspectives. Earth's practicality grounds Air's ideas, while Air helps Earth think outside the box.",
        'Earth-Water': "Earth and Water are naturally compatible. Water nourishes Earth's growth, and Earth gives Water stability and direction. A nurturing connection.",
        'Air-Water': "Air and Water create interesting dynamics. Air brings logic to Water's emotions, while Water adds depth to Air's thoughts. Balance is important."
    };
    
    const key1 = `${boyZodiac.element}-${girlZodiac.element}`;
    const key2 = `${girlZodiac.element}-${boyZodiac.element}`;
    
    return compatibility[key1] || compatibility[key2] || "You bring unique energies to the relationship. Embrace your differences!";
}

// Generate conversation topics
function generateTopics(compatibility, boyBio, girlBio, boyName, girlName) {
    const topics = [];
    
    // Based on compatibility score
    if (compatibility.overall >= 75) {
        topics.push({
            title: "🌟 Future Dreams & Aspirations",
            description: `Your high compatibility suggests strong alignment. Discuss your dreams, career goals, and where you see yourselves in 5-10 years. Share your vision of an ideal future together.`
        });
    }
    
    if (compatibility.overall < 75) {
        topics.push({
            title: "🔍 Understanding Differences",
            description: `Every relationship benefits from understanding. Talk about your different perspectives, what makes each of you unique, and how you can appreciate these differences.`
        });
    }
    
    // Based on biorhythms
    if (boyBio.emotional > 0 && girlBio.emotional > 0) {
        topics.push({
            title: "❤️ Emotional Intimacy",
            description: `Both of your emotional cycles are positive right now. This is a perfect time to share deeper feelings, childhood memories, what makes you feel loved, and your emotional needs.`
        });
    }
    
    if (boyBio.intellectual > 50 || girlBio.intellectual > 50) {
        topics.push({
            title: "🧠 Intellectual Conversations",
            description: `Your intellectual biorhythms are strong! Discuss philosophy, current events, books, documentaries, or ideas that fascinate you. Challenge each other's thinking.`
        });
    }
    
    if (boyBio.physical > 0 && girlBio.physical > 0) {
        topics.push({
            title: "🌈 Shared Adventures",
            description: `Your physical cycles are aligned! Plan activities together - try a new restaurant, go hiking, take a dance class, or explore a new place. Create shared experiences.`
        });
    }
    
    // Universal important topics
    topics.push({
        title: "💭 Values & Beliefs",
        description: `Discuss what matters most to you - family, career, spirituality, personal growth. Understanding each other's core values strengthens your bond.`
    });
    
    topics.push({
        title: "🎯 Love Languages",
        description: `Talk about how you each prefer to give and receive love. Do you value words of affirmation, quality time, physical touch, acts of service, or receiving gifts?`
    });
    
    topics.push({
        title: "🌱 Personal Growth",
        description: `Share what you're working on improving in yourselves, your goals for personal development, and how you can support each other's growth journey.`
    });
    
    topics.push({
        title: "😊 Joy & Laughter",
        description: `Share funny stories, childhood memories, embarrassing moments, and what makes you laugh. Humor creates connection and eases tension.`
    });
    
    topics.push({
        title: "🎨 Passions & Hobbies",
        description: `Talk about what excites you, your hobbies, hidden talents, and what you'd love to learn. Maybe discover new interests you can explore together.`
    });
    
    return topics.slice(0, 6); // Return top 6 topics
}

// Main analysis function
function analyzeCompatibility() {
    const boyName = document.getElementById('boy-name').value;
    const girlName = document.getElementById('girl-name').value;
    const boyDOBStr = document.getElementById('boy-dob').value;
    const girlDOBStr = document.getElementById('girl-dob').value;
    
    if (!boyName || !girlName || !boyDOBStr || !girlDOBStr) {
        alert('Please fill in all fields!');
        return;
    }
    
    const boyDOB = new Date(boyDOBStr);
    const girlDOB = new Date(girlDOBStr);
    
    // Calculate everything
    const compatibility = calculateCompatibility(boyDOB, girlDOB);
    const boyBio = calculateBiorhythm(boyDOB);
    const girlBio = calculateBiorhythm(girlDOB);
    
    // Display results
    document.getElementById('results').style.display = 'block';
    
    // Compatibility score with animation
    animateValue('compatibility-score', 0, compatibility.overall, 1500);
    document.getElementById('compatibility-message').textContent = getCompatibilityMessage(compatibility.overall);
    
    // Breakdown scores
    setTimeout(() => {
        document.getElementById('emotional-bar').style.width = compatibility.emotional + '%';
        document.getElementById('emotional-score').textContent = compatibility.emotional + '%';
        
        document.getElementById('intellectual-bar').style.width = compatibility.intellectual + '%';
        document.getElementById('intellectual-score').textContent = compatibility.intellectual + '%';
        
        document.getElementById('physical-bar').style.width = compatibility.physical + '%';
        document.getElementById('physical-score').textContent = compatibility.physical + '%';
    }, 500);
    
    // Biorhythms
    drawBiorhythmChart('boy-biorhythm', boyDOB);
    drawBiorhythmChart('girl-biorhythm', girlDOB);
    
    // Biorhythm stats
    const boyPhysicalStatus = getBiorhythmStatus(boyBio.physical);
    const boyEmotionalStatus = getBiorhythmStatus(boyBio.emotional);
    const boyIntellectualStatus = getBiorhythmStatus(boyBio.intellectual);
    
    document.getElementById('boy-physical').innerHTML = `<span style="color: ${boyPhysicalStatus.color}">${boyPhysicalStatus.text}</span> (${boyBio.physical > 0 ? '+' : ''}${boyBio.physical})`;
    document.getElementById('boy-emotional').innerHTML = `<span style="color: ${boyEmotionalStatus.color}">${boyEmotionalStatus.text}</span> (${boyBio.emotional > 0 ? '+' : ''}${boyBio.emotional})`;
    document.getElementById('boy-intellectual').innerHTML = `<span style="color: ${boyIntellectualStatus.color}">${boyIntellectualStatus.text}</span> (${boyBio.intellectual > 0 ? '+' : ''}${boyBio.intellectual})`;
    
    const girlPhysicalStatus = getBiorhythmStatus(girlBio.physical);
    const girlEmotionalStatus = getBiorhythmStatus(girlBio.emotional);
    const girlIntellectualStatus = getBiorhythmStatus(girlBio.intellectual);
    
    document.getElementById('girl-physical').innerHTML = `<span style="color: ${girlPhysicalStatus.color}">${girlPhysicalStatus.text}</span> (${girlBio.physical > 0 ? '+' : ''}${girlBio.physical})`;
    document.getElementById('girl-emotional').innerHTML = `<span style="color: ${girlEmotionalStatus.color}">${girlEmotionalStatus.text}</span> (${girlBio.emotional > 0 ? '+' : ''}${girlBio.emotional})`;
    document.getElementById('girl-intellectual').innerHTML = `<span style="color: ${girlIntellectualStatus.color}">${girlIntellectualStatus.text}</span> (${girlBio.intellectual > 0 ? '+' : ''}${girlBio.intellectual})`;
    
    // Topics
    const topics = generateTopics(compatibility, boyBio, girlBio, boyName, girlName);
    const topicsList = document.getElementById('topics-list');
    topicsList.innerHTML = topics.map(topic => `
        <div class="topic-item">
            <h4>${topic.title}</h4>
            <p>${topic.description}</p>
        </div>
    `).join('');
    
    // Zodiac info
    document.getElementById('boy-zodiac').textContent = `${boyName} - ${compatibility.boyZodiac.name} ${getZodiacEmoji(compatibility.boyZodiac.name)}`;
    document.getElementById('boy-zodiac-desc').textContent = compatibility.boyZodiac.traits;
    
    document.getElementById('girl-zodiac').textContent = `${girlName} - ${compatibility.girlZodiac.name} ${getZodiacEmoji(compatibility.girlZodiac.name)}`;
    document.getElementById('girl-zodiac-desc').textContent = compatibility.girlZodiac.traits;
    
    document.getElementById('zodiac-compatibility-text').textContent = getZodiacCompatibilityText(compatibility.boyZodiac, compatibility.girlZodiac);
    
    // Scroll to results
    setTimeout(() => {
        document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
}

// Animate number counting
function animateValue(id, start, end, duration) {
    const element = document.getElementById(id);
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.round(current);
    }, 16);
}

// Get zodiac emoji
function getZodiacEmoji(zodiac) {
    const emojis = {
        'Aries': '♈', 'Taurus': '♉', 'Gemini': '♊', 'Cancer': '♋',
        'Leo': '♌', 'Virgo': '♍', 'Libra': '♎', 'Scorpio': '♏',
        'Sagittarius': '♐', 'Capricorn': '♑', 'Aquarius': '♒', 'Pisces': '♓'
    };
    return emojis[zodiac] || '⭐';
}

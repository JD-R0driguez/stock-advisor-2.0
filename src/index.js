const tickersArr = []

let sp500Companies = [];
let currentIndex = -1;
let foundCompany = false;
let matchesCache = [];     
const searchBar = document.getElementById('company-input');
const suggestionsDiv = document.getElementById('suggestions');
const addTickerButton = document.getElementById('add-ticker-btn');
const notFoundLabel = document.querySelector('.not-found span');
const tickersContainer = document.getElementById('tickers-container');
const generateReportBtn = document.querySelector('#get-report-btn');


searchBar.addEventListener('input', handleCompanySearch);
searchBar.addEventListener('keydown', handleKeyNavigation);
searchBar.addEventListener('focus', handleSearchBarFocus);
addTickerButton.addEventListener('click', addTicker)
generateReportBtn.addEventListener('click', fetchStockData);



document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('./public/sp500_companies.json');
        sp500Companies = await response.json();
        console.log(sp500Companies);
    } catch (error) {
        console.error('Error fetching S&P 500 data:', error);
    }
});

document.addEventListener('click', (event) => {
    if (
        !searchBar.contains(event.target) &&
        !suggestionsDiv.contains(event.target)
    ) {
        suggestionsDiv.classList.remove('active');
    }
});

function handleSearchBarFocus() {
    if (searchBar.value && matchesCache.length > 0) {
      showSuggestions(matchesCache);
    }
}

function handleCompanySearch(event) {
    const input = event.target.value.toLowerCase();
    suggestionsDiv.innerHTML = '';

    currentIndex = -1;

    if (!input) {
        notFoundLabel.classList.remove('active');
        suggestionsDiv.classList.remove('active');
        matchesCache = [];
        return;
    }

    const matches = sp500Companies.filter(company => 
        company.name.toLowerCase().includes(input) || company.ticker.toLowerCase().includes(input)).slice(0, 7);
    
    matchesCache = matches;
    
    if (matches.length === 0) {
        suggestionsDiv.classList.remove('active');
        notFoundLabel.classList.add('active');
        return;
    }
    
    notFoundLabel.classList.remove('active');
    showSuggestions(matches);

}

function showSuggestions(matches) {
    
    suggestionsDiv.classList.add('active');
    suggestionsDiv.innerHTML = matches.map(match => `
        <div class="suggestion-item" data-ticker="${match.ticker}">
            ${match.ticker} - ${match.name}
        </div>
    `).join('');

    document.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
            searchBar.value = item.getAttribute('data-ticker');
            suggestionsDiv.innerHTML = '';
            foundCompany = true;
        });
    });
}
  

function handleKeyNavigation(event) {
    const items = document.querySelectorAll('.suggestion-item')
    
    if (items.length > 0) {
        if (event.key === 'ArrowDown') {
            event.preventDefault()
            currentIndex = (currentIndex + 1) % items.length
            highlightItem(items)
        } else if (event.key === 'ArrowUp') {
            event.preventDefault()
            currentIndex = (currentIndex - 1 + items.length) % items.length
            highlightItem(items)
        } else if (event.key === 'Enter' && currentIndex >= 0) {
            event.preventDefault()
            items[currentIndex].click()
        }
    }

}

function highlightItem(items) {

    items.forEach((item, index) => {
        if (index === currentIndex) {
            item.classList.add('highlight')
            item.scrollIntoView({ block: 'nearest' })
        } else {
            item.classList.remove('highlight')
        }
    });
}

function addTicker(event) {
    event.target.classList.toggle('active');

    event.preventDefault()
        if (foundCompany) {
            const newTickerStr = searchBar.value
            tickersArr.push(newTickerStr.toUpperCase())
            createTickerElement(newTickerStr)
            searchBar.value = ''
            foundCompany = false
            renderTickers()
            updateButtonStates();
        } 
}

function createTickerElement(tickerText) {
    const tickerHTML = `
        <div class="ticker-container">
            <div class="text-section">${tickerText}</div>
            <div class="close-button"></div>
        </div>
        `;
  
    tickersContainer.insertAdjacentHTML('beforeend', tickerHTML);
    const closeButton = tickersContainer.querySelector('.ticker-container:last-child .close-button');
    
    closeButton.addEventListener('click', () => {
        removeTicker(tickerText);
    });
}

function renderTickers() {
    tickersContainer.innerHTML = '';
    tickersArr.forEach(createTickerElement);
}
  
function removeTicker(tickerText) {
    tickersArr.splice(tickersArr.indexOf(tickerText), 1);
    renderTickers();
    updateButtonStates(); 
}

function updateButtonStates() {
    generateReportBtn.disabled = tickersArr.length === 0;
    console.log(generateReportBtn.disabled)
    addTickerButton.disabled = tickersArr.length >= 3;
}
  
async function fetchStockData(tickers) {
    try {
        const response = await fetch('../api/polygon', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tickers)
        });
        const result = await response.json();
        if (response.ok) {
            console.log('Stock data:', result.data);
        } else {
            console.error('Error:', result.error);
        }
        } catch (error) {
        console.error('Request failed:', error);
        }
}

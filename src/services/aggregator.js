import { config } from '../config.js';

export function aggregateCurrentWeather(results) {
  const validSources = results.filter(r => r.status === 'fulfilled' && r.value !== null);

  if (validSources.length === 0) {
    throw new Error('All weather sources failed');
  }

  const weights = {
    openMeteo: config.weights.openMeteo,
    openWeather: config.weights.openWeather,
    weatherApi: config.weights.weatherApi
  };

  let totalWeight = 0;
  let weightedSum = {
    temp: 0,
    humidity: 0,
    windSpeed: 0,
    precipitation: 0
  };

  validSources.forEach(source => {
    const weight = weights[source.name] || 0.33;
    totalWeight += weight;

    weightedSum.temp += source.value.temp * weight;
    weightedSum.humidity += source.value.humidity * weight;
    weightedSum.windSpeed += source.value.windSpeed * weight;
    weightedSum.precipitation += source.value.precipitation * weight;
  });

  const aggregated = {
    temp: round(weightedSum.temp / totalWeight),
    humidity: round(weightedSum.humidity / totalWeight),
    windSpeed: round(weightedSum.windSpeed / totalWeight),
    precipitation: round(weightedSum.precipitation / totalWeight),
    description: getMostCommonDescription(validSources.map(s => s.value.description))
  };

  const confidence = calculateConfidence(validSources.map(s => s.value.temp));

  const sources = {};
  results.forEach(r => {
    if (r.status === 'fulfilled' && r.value) {
      sources[r.name] = {
        temp: r.value.temp,
        humidity: r.value.humidity,
        windSpeed: r.value.windSpeed,
        description: r.value.description,
        status: 'success'
      };
    } else if (r.status === 'rejected') {
      sources[r.name] = {
        status: 'error',
        error: r.reason
      };
    }
  });

  return {
    aggregated,
    sources,
    confidence
  };
}

export function aggregateForecast(results) {
  const validSources = results.filter(r => r.status === 'fulfilled' && r.value !== null);

  if (validSources.length === 0) {
    throw new Error('All forecast sources failed');
  }

  const weights = {
    openMeteo: config.weights.openMeteo,
    openWeather: config.weights.openWeather,
    weatherApi: config.weights.weatherApi
  };

  const allDates = new Set();
  validSources.forEach(s => s.value.forEach(d => allDates.add(d.date)));

  const aggregated = [];

  allDates.forEach(date => {
    const dayData = validSources.map(s => ({
      source: s.name,
      data: s.value.find(d => d.date === date)
    })).filter(d => d.data);

    let totalWeight = 0;
    let weightedSum = {
      tempMax: 0,
      tempMin: 0,
      precipitation: 0,
      windSpeed: 0
    };

    dayData.forEach(({ source, data }) => {
      const weight = weights[source] || 0.33;
      totalWeight += weight;
      weightedSum.tempMax += data.tempMax * weight;
      weightedSum.tempMin += data.tempMin * weight;
      weightedSum.precipitation += data.precipitation * weight;
      weightedSum.windSpeed += data.windSpeed * weight;
    });

    aggregated.push({
      date,
      tempMax: round(weightedSum.tempMax / totalWeight),
      tempMin: round(weightedSum.tempMin / totalWeight),
      precipitation: round(weightedSum.precipitation / totalWeight),
      windSpeed: round(weightedSum.windSpeed / totalWeight),
      description: getMostCommonDescription(dayData.map(d => d.data.description))
    });
  });

  aggregated.sort((a, b) => a.date.localeCompare(b.date));

  const sources = {};
  results.forEach(r => {
    if (r.status === 'fulfilled' && r.value) {
      sources[r.name] = {
        forecastCount: r.value.length,
        status: 'success'
      };
    } else if (r.status === 'rejected') {
      sources[r.name] = {
        status: 'error',
        error: r.reason
      };
    }
  });

  return {
    aggregated,
    sources
  };
}

function round(value) {
  return Math.round(value * 10) / 10;
}

function getMostCommonDescription(descriptions) {
  const counts = {};
  descriptions.forEach(d => {
    counts[d] = (counts[d] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

function calculateConfidence(temps) {
  if (temps.length <= 1) return 0.7;

  const mean = temps.reduce((a, b) => a + b, 0) / temps.length;
  const variance = temps.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / temps.length;
  const stdDev = Math.sqrt(variance);

  const maxDiff = 5;
  const confidence = Math.max(0.5, Math.min(1, 1 - (stdDev / maxDiff)));

  return round(confidence);
}

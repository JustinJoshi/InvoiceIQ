# InvoiceIQ

A full-stack personal metrics dashboard that helps you track and visualize data from multiple sources. Connect your favorite apps, manually enter data points, and see everything in one beautiful interface with real-time charts and analytics.

**Link to project:**  [InvoiceIQ Dashboard](https://invoiceiq.onrender.com/)



<img width="2559" height="1312" alt="2025-11-06_13-40" src="https://github.com/user-attachments/assets/12626edd-de81-4ce8-86a4-b4a066bd6970" />

<img width="2556" height="1306" alt="2025-11-06_13-40_1" src="https://github.com/user-attachments/assets/97f9c76a-326a-4f31-bb70-e90e308a30e5" />

<img width="2534" height="1315" alt="2025-11-06_13-40_2" src="https://github.com/user-attachments/assets/df054f07-7ca9-4c83-af74-4097cde62f10" />

## How It's Made:

**Tech used:** Node.js, Express, MongoDB, EJS, Chart.js, JavaScript, CSS

I built this as a personal metrics tracking platform where users can connect multiple data sources or manually enter information. The backend uses Express and Node.js to handle API endpoints and authentication. MongoDB stores user data, data source connections, and all the metrics collected over time.

The dashboard features a clean, dark-themed interface with a fixed sidebar for navigation and a main content area showing stats cards, interactive charts, and data tables. I used Chart.js to create the activity trends visualization that updates based on the selected time range. The stats grid displays key metrics with percentage changes and color-coded indicators.

Users can add data sources through an interface where they configure API keys, refresh rates, and select which data types to sync. I also implemented a quick manual entry form for users who want to add data points without connecting external APIs. The entire UI is built with EJS templates and custom CSS using CSS Grid and Flexbox for responsive layouts.

The authentication system allows users to create accounts and securely store their data. Each user has their own dashboard that pulls from their connected sources and manual entries.

## Optimizations

I could implement WebSocket connections for real-time data updates instead of requiring page refreshes. This would make the dashboard feel more dynamic and show changes as they happen.

The dashboard could benefit from lazy loading for the charts and tables. Loading data only when users scroll to those sections would improve initial page load times, especially for users with lots of historical data.

Implementing a service worker for offline functionality would let users view their cached metrics even without internet connection. The app could queue manual entries and sync them when connectivity returns.

For scaling purposes, I could add data sampling for large datasets. Instead of rendering thousands of data points, the chart could intelligently sample and display representative data while maintaining accuracy.

## Lessons Learned:

I learned the importance of responsive design that works across zoom levels. Initially, the layout broke when users zoomed in or out, but using relative units (rem, %) instead of fixed pixels solved this issue. Testing at different zoom levels became part of my development workflow.

Working with Chart.js showed me how to balance visual appeal with performance. Charts with too many data points can slow down the page, so I learned to think about data visualization strategy early in development.

Authentication and data security were key learning areas. Storing API keys and personal metrics meant implementing proper encryption and secure session management. I gained deeper understanding of how to protect user data in full-stack applications.

Building the modal system for adding data sources taught me about managing UI state in vanilla JavaScript. Handling form submissions, validation, and dynamic content updates without a framework reinforced fundamental JavaScript skills.

## Examples:

Take a look at these other projects in my portfolio:

**Vaccines API - Adult Edition:** https://github.com/JustinJoshi/vaccines-api-adult

**Vaccines API - Birth Edition:** https://github.com/JustinJoshi/vaccines-api-birth

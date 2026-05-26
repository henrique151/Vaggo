// Swagger UI Premium Dark Theme - Custom Styling for Veggo

export const swaggerCustomCss = `
/* Core Layout & Backgrounds */
body {
    margin: 0;
    background-color: #0b0c10 !important;
}

.swagger-ui {
    background-color: #0b0c10 !important;
    color: #e2e8f0 !important;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
}

/* Scrollbars */
::-webkit-scrollbar {
    width: 10px;
    height: 10px;
}
::-webkit-scrollbar-track {
    background: #0f172a;
}
::-webkit-scrollbar-thumb {
    background: #1e293b;
    border-radius: 5px;
}
::-webkit-scrollbar-thumb:hover {
    background: #334155;
}

/* Header & Information */
.swagger-ui .topbar {
    background-color: #0f172a !important;
    border-bottom: 2px solid #10b981 !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4) !important;
    padding: 12px 0;
}

.swagger-ui .topbar .download-url-wrapper .select-label select {
    border: 1px solid #334155 !important;
    background: #1e293b !important;
    color: #e2e8f0 !important;
}

.swagger-ui .info {
    margin: 40px 0 !important;
    padding: 24px !important;
    background: rgba(30, 41, 59, 0.4) !important;
    border: 1px solid rgba(255, 255, 255, 0.05) !important;
    border-radius: 16px !important;
    backdrop-filter: blur(12px) !important;
}

.swagger-ui .info .title {
    color: #ffffff !important;
    font-size: 2.8rem !important;
    font-weight: 800 !important;
    letter-spacing: -0.03em !important;
    background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%) !important;
    -webkit-background-clip: text !important;
    -webkit-text-fill-color: transparent !important;
    margin-bottom: 12px !important;
}

.swagger-ui .info p, 
.swagger-ui .info li, 
.swagger-ui .info td, 
.swagger-ui .info a {
    color: #94a3b8 !important;
    font-size: 1rem !important;
    line-height: 1.6 !important;
}

.swagger-ui .info a:hover {
    color: #10b981 !important;
}

/* Servers & Authorization */
.swagger-ui .scheme-container {
    background-color: #0f172a !important;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3) !important;
    border: 1px solid rgba(255, 255, 255, 0.05) !important;
    border-radius: 14px !important;
    padding: 20px !important;
    margin: 20px 0 !important;
}

.swagger-ui .scheme-container select {
    background: #1e293b !important;
    color: #e2e8f0 !important;
    border: 1px solid #334155 !important;
    border-radius: 6px !important;
    padding: 6px 12px !important;
}

.swagger-ui .btn.authorize {
    background-color: transparent !important;
    color: #10b981 !important;
    border: 2px solid #10b981 !important;
    border-radius: 8px !important;
    font-weight: 600 !important;
    transition: all 0.2s ease-in-out !important;
}

.swagger-ui .btn.authorize:hover {
    background-color: #10b981 !important;
    color: #0f172a !important;
    box-shadow: 0 0 15px rgba(16, 185, 129, 0.4) !important;
}

.swagger-ui .btn.authorize svg {
    fill: currentColor !important;
}

/* Modal Styling */
.swagger-ui .dialog-ux .modal-ux {
    background-color: #0f172a !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 16px !important;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6) !important;
}

.swagger-ui .dialog-ux .modal-ux-header {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
    padding: 20px !important;
}

.swagger-ui .dialog-ux .modal-ux-header h3 {
    color: #ffffff !important;
}

.swagger-ui .dialog-ux .modal-ux-content {
    padding: 20px !important;
}

.swagger-ui .dialog-ux .modal-ux-content h4 {
    color: #e2e8f0 !important;
}

.swagger-ui .dialog-ux .modal-ux-content p {
    color: #94a3b8 !important;
}

.swagger-ui .dialog-ux .modal-ux-content input[type=text],
.swagger-ui .dialog-ux .modal-ux-content input[type=password] {
    background: #1e293b !important;
    border: 1px solid #334155 !important;
    color: #ffffff !important;
    border-radius: 6px !important;
    padding: 8px !important;
}

/* Operations & Blocks Styling */
.swagger-ui .opblock-tag-section {
    background: rgba(30, 41, 59, 0.2) !important;
    border: 1px solid rgba(255, 255, 255, 0.03) !important;
    border-radius: 12px !important;
    margin-bottom: 24px !important;
    overflow: hidden !important;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
}

.swagger-ui .opblock-tag {
    color: #ffffff !important;
    font-size: 1.3rem !important;
    font-weight: 700 !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
    padding: 16px 20px !important;
    background: rgba(30, 41, 59, 0.4) !important;
}

.swagger-ui .opblock-tag small {
    color: #94a3b8 !important;
    font-weight: 400 !important;
}

.swagger-ui .opblock {
    margin: 12px 20px !important;
    border-radius: 8px !important;
    border: 1px solid rgba(255, 255, 255, 0.05) !important;
    background: rgba(30, 41, 59, 0.15) !important;
    transition: transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out !important;
}

.swagger-ui .opblock:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25) !important;
}

/* Method Badge Colors & Backgrounds */
.swagger-ui .opblock.opblock-get {
    border-color: rgba(59, 130, 246, 0.2) !important;
    background: rgba(59, 130, 246, 0.04) !important;
}
.swagger-ui .opblock.opblock-get:hover {
    border-color: rgba(59, 130, 246, 0.4) !important;
}
.swagger-ui .opblock.opblock-get .opblock-summary-method {
    background: #2563eb !important;
    color: #ffffff !important;
    border-radius: 6px !important;
    font-weight: bold !important;
}

.swagger-ui .opblock.opblock-post {
    border-color: rgba(16, 185, 129, 0.2) !important;
    background: rgba(16, 185, 129, 0.04) !important;
}
.swagger-ui .opblock.opblock-post:hover {
    border-color: rgba(16, 185, 129, 0.4) !important;
}
.swagger-ui .opblock.opblock-post .opblock-summary-method {
    background: #059669 !important;
    color: #ffffff !important;
    border-radius: 6px !important;
    font-weight: bold !important;
}

.swagger-ui .opblock.opblock-put {
    border-color: rgba(245, 158, 11, 0.2) !important;
    background: rgba(245, 158, 11, 0.04) !important;
}
.swagger-ui .opblock.opblock-put:hover {
    border-color: rgba(245, 158, 11, 0.4) !important;
}
.swagger-ui .opblock.opblock-put .opblock-summary-method {
    background: #d97706 !important;
    color: #ffffff !important;
    border-radius: 6px !important;
    font-weight: bold !important;
}

.swagger-ui .opblock.opblock-delete {
    border-color: rgba(239, 68, 68, 0.2) !important;
    background: rgba(239, 68, 68, 0.04) !important;
}
.swagger-ui .opblock.opblock-delete:hover {
    border-color: rgba(239, 68, 68, 0.4) !important;
}
.swagger-ui .opblock.opblock-delete .opblock-summary-method {
    background: #dc2626 !important;
    color: #ffffff !important;
    border-radius: 6px !important;
    font-weight: bold !important;
}

.swagger-ui .opblock.opblock-patch {
    border-color: rgba(168, 85, 247, 0.2) !important;
    background: rgba(168, 85, 247, 0.04) !important;
}
.swagger-ui .opblock.opblock-patch:hover {
    border-color: rgba(168, 85, 247, 0.4) !important;
}
.swagger-ui .opblock.opblock-patch .opblock-summary-method {
    background: #9333ea !important;
    color: #ffffff !important;
    border-radius: 6px !important;
    font-weight: bold !important;
}

/* Operation Summary Text */
.swagger-ui .opblock .opblock-summary-path {
    color: #f1f5f9 !important;
    font-size: 1.05rem !important;
    font-weight: 600 !important;
}

.swagger-ui .opblock .opblock-summary-description {
    color: #94a3b8 !important;
    font-size: 0.95rem !important;
}

/* Expanded Sections */
.swagger-ui .opblock-body {
    background: #0f172a !important;
    padding: 20px !important;
    border-top: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.swagger-ui .tabli button {
    color: #94a3b8 !important;
    font-weight: 600 !important;
}

.swagger-ui .tabli.active button {
    color: #10b981 !important;
}

.swagger-ui .opblock-section-header {
    background: rgba(255, 255, 255, 0.02) !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
    padding: 8px 12px !important;
    border-radius: 6px !important;
}

.swagger-ui .opblock-section-header h4 {
    color: #ffffff !important;
}

/* Tables, Inputs & Try it out */
.swagger-ui table thead tr td,
.swagger-ui table thead tr th {
    color: #cbd5e1 !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.swagger-ui .parameters-col_name {
    color: #e2e8f0 !important;
}

.swagger-ui .parameter__name.required {
    color: #ef4444 !important;
}

.swagger-ui .parameter__type {
    color: #10b981 !important;
}

.swagger-ui input[type=text],
.swagger-ui textarea {
    background: #1e293b !important;
    border: 1px solid #334155 !important;
    color: #ffffff !important;
    border-radius: 6px !important;
    padding: 8px !important;
    font-family: monospace !important;
}

.swagger-ui .btn.try-out__btn {
    background-color: #3b82f6 !important;
    color: #ffffff !important;
    border: none !important;
    border-radius: 6px !important;
    font-weight: 600 !important;
    transition: background 0.2s !important;
}

.swagger-ui .btn.try-out__btn:hover {
    background-color: #2563eb !important;
}

.swagger-ui .btn.execute {
    background-color: #10b981 !important;
    color: #ffffff !important;
    border: none !important;
    border-radius: 6px !important;
    font-weight: 600 !important;
}

.swagger-ui .btn.execute:hover {
    background-color: #059669 !important;
    box-shadow: 0 0 10px rgba(16, 185, 129, 0.4) !important;
}

/* Responses & Model/Schemas */
.swagger-ui .response-col_status {
    color: #ffffff !important;
    font-weight: bold !important;
}

.swagger-ui .response-col_description {
    color: #cbd5e1 !important;
}

.swagger-ui .microlight {
    background-color: #1e293b !important;
    border-radius: 8px !important;
    border: 1px solid rgba(255, 255, 255, 0.05) !important;
    color: #e2e8f0 !important;
    padding: 16px !important;
}

.swagger-ui .model-box {
    background: #1e293b !important;
    border: 1px solid rgba(255, 255, 255, 0.05) !important;
    border-radius: 8px !important;
    padding: 12px !important;
}

.swagger-ui .model {
    color: #e2e8f0 !important;
}

.swagger-ui .model-title {
    color: #ffffff !important;
}

.swagger-ui .prop-name {
    color: #94a3b8 !important;
}

.swagger-ui .prop-type {
    color: #3b82f6 !important;
}

/* Block buttons */
.swagger-ui .authorization__btn_auth {
    fill: #10b981 !important;
}

/* Version badge */
.swagger-ui .info .version {
    background: #10b981 !important;
    color: #0f172a !important;
    font-weight: bold !important;
    border-radius: 12px !important;
    padding: 4px 10px !important;
}
`;

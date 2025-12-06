-- CreateIndex
CREATE INDEX "clients_name_idx" ON "clients"("name");

-- CreateIndex
CREATE INDEX "clients_email_idx" ON "clients"("email");

-- CreateIndex
CREATE INDEX "invoice_items_invoiceId_idx" ON "invoice_items"("invoiceId");

-- CreateIndex
CREATE INDEX "invoice_items_invoiceType_idx" ON "invoice_items"("invoiceType");

-- CreateIndex
CREATE INDEX "invoice_items_description_idx" ON "invoice_items"("description");

-- CreateIndex
CREATE INDEX "products_supplierId_idx" ON "products"("supplierId");

-- CreateIndex
CREATE INDEX "purchase_invoices_date_idx" ON "purchase_invoices"("date");

-- CreateIndex
CREATE INDEX "purchase_invoices_status_idx" ON "purchase_invoices"("status");

-- CreateIndex
CREATE INDEX "purchase_invoices_supplierId_idx" ON "purchase_invoices"("supplierId");

-- CreateIndex
CREATE INDEX "purchase_invoices_createdAt_idx" ON "purchase_invoices"("createdAt");

-- CreateIndex
CREATE INDEX "sale_invoices_date_idx" ON "sale_invoices"("date");

-- CreateIndex
CREATE INDEX "sale_invoices_status_idx" ON "sale_invoices"("status");

-- CreateIndex
CREATE INDEX "sale_invoices_clientId_idx" ON "sale_invoices"("clientId");

-- CreateIndex
CREATE INDEX "sale_invoices_createdAt_idx" ON "sale_invoices"("createdAt");

-- CreateIndex
CREATE INDEX "suppliers_name_idx" ON "suppliers"("name");

-- CreateIndex
CREATE INDEX "suppliers_email_idx" ON "suppliers"("email");

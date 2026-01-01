#!/bin/bash
# Fix RLS policies for Occurrences

# Get DB Name
DB_NAME=$(sudo docker exec maison-manager-db-1 printenv POSTGRES_DB)
if [ -z "$DB_NAME" ]; then
    DB_NAME="maison_manager"
fi

echo "Applicando correção de permissões no banco: $DB_NAME"
echo "Restringindo acesso a: ADMIN, SINDICO, SUBSINDICO, PORTEIRO"

sudo docker exec -i maison-manager-db-1 psql -U postgres -d $DB_NAME -c "
DROP POLICY IF EXISTS occurrences_select_policy ON occurrences;
CREATE POLICY occurrences_select_policy ON occurrences FOR SELECT
    USING (
        condominium_id = current_condo_id()
        AND (
            current_app_role() IN ('ADMIN', 'SINDICO', 'SUBSINDICO', 'PORTEIRO') OR
            user_id = current_user_id()
        )
    );

DROP POLICY IF EXISTS occurrences_update_policy ON occurrences;
CREATE POLICY occurrences_update_policy ON occurrences FOR UPDATE
    USING (
        condominium_id = current_condo_id()
        AND (
            current_app_role() IN ('ADMIN', 'SINDICO', 'SUBSINDICO', 'PORTEIRO') OR
            (user_id = current_user_id() AND status = 'ABERTO')
        )
    )
    WITH CHECK (
        condominium_id = current_condo_id()
        AND (
            current_app_role() IN ('ADMIN', 'SINDICO', 'SUBSINDICO', 'PORTEIRO') OR
            (user_id = current_user_id() AND status = 'ABERTO')
        )
    );
"
echo "Permissões de Ocorrências atualizadas com sucesso!"

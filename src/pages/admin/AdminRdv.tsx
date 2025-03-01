
import React from "react";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import RdvForm from "@/components/admin/rdv/RdvForm";
import RdvList from "@/components/admin/rdv/RdvList";
import { useRdvAdmin } from "@/hooks/useRdvAdmin";

const AdminRdv = () => {
  const { rdvList, loading, isAdmin, handleDeleteRdv, handleAddNewRdv } = useRdvAdmin();

  if (!isAdmin) {
    return (
      <div>
        <AdminNavbar />
        <div className="container mx-auto p-8">
          <h1 className="text-3xl font-bold mb-8">Accès non autorisé</h1>
          <p>Vous devez être administrateur pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminNavbar />
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Gestion des rendez-vous</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Add RDV Form */}
          <RdvForm onRdvAdded={handleAddNewRdv} />

          {/* RDV List */}
          <RdvList 
            rdvList={rdvList} 
            loading={loading} 
            onDeleteRdv={handleDeleteRdv} 
          />
        </div>
      </div>
    </div>
  );
};

export default AdminRdv;

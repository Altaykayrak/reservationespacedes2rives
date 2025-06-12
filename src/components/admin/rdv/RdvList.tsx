
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Rdv } from "@/types/rdv";
import RdvItem from "./RdvItem";
import RdvFilters from "./RdvFilters";
import RdvExportButton from "./RdvExportButton";
import { filterRdvList } from "./rdvFilterUtils";

interface RdvListProps {
  rdvList: Rdv[];
  loading: boolean;
  onDeleteRdv: (id: string) => void;
}

const RdvList: React.FC<RdvListProps> = ({ rdvList, loading, onDeleteRdv }) => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [status, setStatus] = useState<string>("all");
  const [selectedMotifs, setSelectedMotifs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filter rdvList based on the filter criteria
  const filteredRdvList = filterRdvList(
    rdvList,
    startDate,
    endDate,
    status,
    selectedMotifs,
    searchQuery
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex flex-col">
          <CardTitle>Rendez-vous disponibles</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredRdvList.length} rendez-vous{filteredRdvList.length > 1 ? "" : ""} 
            {filteredRdvList.length !== rdvList.length && ` sur ${rdvList.length} au total`}
          </p>
        </div>
        <RdvExportButton
          filteredRdvList={filteredRdvList}
          startDate={startDate}
          endDate={endDate}
          status={status}
          selectedMotifs={selectedMotifs}
          searchQuery={searchQuery}
        />
      </CardHeader>
      <CardContent>
        <RdvFilters
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          status={status}
          setStatus={setStatus}
          selectedMotifs={selectedMotifs}
          setSelectedMotifs={setSelectedMotifs}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {loading ? (
          <div className="text-center py-4">Chargement...</div>
        ) : filteredRdvList.length === 0 ? (
          <div className="text-center py-4">Aucun rendez-vous ne correspond aux critères</div>
        ) : (
          <div className="space-y-4">
            {filteredRdvList.map((rdv) => (
              <RdvItem 
                key={rdv.id} 
                rdv={rdv} 
                onDeleteRdv={onDeleteRdv} 
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RdvList;

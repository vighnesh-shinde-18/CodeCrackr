import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import ViewHistoryDialog from "./ViewHistoryDialog";

const typeToName = {
  codeDebugging: "Debug Code",
  codeReview: "Review Code",
  codeGeneration: "Generate Code",
  explainCode: "Explain Code",
  convertCode: "Convert Code",
  generateTestCases: "Generate Test Cases",
};

const featureOptions = [
  { key: "all", label: "All Features" },
  ...Object.entries(typeToName).map(([key, label]) => ({ key, label })),
];

export default function HistoryDialog({ open, setOpen }) {
  const [interactions, setInteractions] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState("all");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const INTERACTIONS_URL = `${BASE_URL}/api/ai/interactions`;

  const fetchInteractions = async (feature = "all") => {
    try {
      const endpoint =
        feature === "all"
          ? INTERACTIONS_URL
          : `${INTERACTIONS_URL}/by-feature`;

      const options =
        feature === "all"
          ? {
              method: "GET",
              credentials: "include",
            }
          : {
              method: "GET",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ featureType: feature }),
            };

      const res = await fetch(endpoint, options);
      const data = await res.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error("Failed to fetch interactions:", error);
      return [];
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${INTERACTIONS_URL}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Entry deleted");
        const updated = await fetchInteractions(selectedFeature);
        setInteractions(updated);
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleDeleteAll = async () => {
    try {
      await fetch(INTERACTIONS_URL, {
        method: "DELETE",
        credentials: "include",
      });
      toast.success("All history cleared");
      const updated = await fetchInteractions(selectedFeature);
      setInteractions(updated);
    } catch {
      toast.error("Failed to clear history");
    }
  };

  useEffect(() => {
    if (open) {
      fetchInteractions(selectedFeature).then(setInteractions);
    }
  }, [open, selectedFeature]);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-4xl px-2 sm:px-6 py-4">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Feature History</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              View and manage your previous feature conversations.
            </DialogDescription>
          </DialogHeader>

          {/* Filter Dropdown */}
          <div className="flex justify-end mb-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="text-sm">
                  {featureOptions.find((f) => f.key === selectedFeature)?.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {featureOptions.map((feature) => (
                  <DropdownMenuItem
                    key={feature.key}
                    onClick={() => setSelectedFeature(feature.key)}
                  >
                    {feature.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* History Table */}
          <div className="overflow-x-auto max-h-[60vh]">
            <Table className="min-w-[600px] sm:min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Feature</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {interactions.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>{typeToName[item.featureType] || "Unknown"}</TableCell>
                    <TableCell className="truncate">
                      {item.aiOutput?.title || "No title"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {item.createdAt?.slice(0, 10) || "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="p-1 h-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedId(item._id);
                            setViewDialogOpen(true);
                          }}>
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(item._id)}>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              onClick={handleDeleteAll}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash className="w-4 h-4" /> Delete All
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <ViewHistoryDialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        itemId={selectedId}
      />
    </>
  );
}

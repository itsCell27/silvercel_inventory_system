import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

function AddEditCategoryDialog({ isOpen, onOpenChange, onSave, editCategory }) {
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    if (editCategory && isOpen) {
      setCategoryName(editCategory.name);
    } else if (!isOpen) {
      setCategoryName("");
    }
  },   [editCategory, isOpen]);

  const handleSubmit = () => {
    if (!categoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    onSave(categoryName.trim());
    setCategoryName("");
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-w-[90vw]">
        <DialogHeader>
          <DialogTitle>{editCategory ? "Edit Category" : "Add Category"}</DialogTitle>
          <DialogDescription>
            {editCategory
              ? "Update the category name below."
              : "Enter a name for the new category."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">Category Name</Label>
            <Input
              id="category-name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Enter category name"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit();
                }
              }}
            />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Button onClick={handleSubmit} className="flex-1">
            {editCategory ? "Update" : "Add"} Category
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const fetchCategories = () => {
    fetch("http://localhost/silvercel_inventory_system/backend/api/categories.php")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          console.error("Fetched data is not an array:", data);
          setCategories([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
        toast.error(`Error fetching categories: ${error.message}`);
        setCategories([]);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = (name) => {
    fetch("http://localhost/silvercel_inventory_system/backend/api/categories.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    })
      .then((response) => response.json())
      .then(() => {
        toast.success("Category added successfully");
        fetchCategories();
      });
  };

  const handleEditCategory = (name) => {
    if (editCategory) {
      fetch("http://localhost/silvercel_inventory_system/backend/api/categories.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: editCategory.id, name }),
      })
        .then((response) => response.json())
        .then(() => {
          toast.success("Category updated successfully");
          fetchCategories();
          setEditCategory(null);
        });
    }
  };

  const handleDeleteSelected = () => {
    if (selectedCategories.length === 0) return;

    const deletePromises = selectedCategories.map(id =>
      fetch(`http://localhost/silvercel_inventory_system/backend/api/categories.php?id=${id}`, {
        method: "DELETE",
      })
    );

    Promise.all(deletePromises)
      .then(() => {
        toast.success(`${selectedCategories.length} categor(y/ies) deleted successfully`);
        fetchCategories();
        setSelectedCategories([]);
        setShowDeleteDialog(false);
      });
  };

  const openEditDialog = (category) => {
    setEditCategory(category);
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditCategory(null);
    setIsDialogOpen(true);
  };

  const toggleCategorySelection = (id) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(categories.map((c) => c.id));
    }
  };

  const openDeleteDialog = () => {
    if (selectedCategories.length === 0) {
      toast.error("Please select at least one category to delete");
      return;
    }
    setShowDeleteDialog(true);
  };

  return (
    <div className="w-full flex flex-col gap-6 mt-2 sm:mt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-between sm:items-center">
        <p className="text-2xl font-semibold">Categories</p>
        <div className="flex gap-2 sm:gap-3">
          {selectedCategories.length > 0 && (
            <Button
              variant="destructive"
              onClick={openDeleteDialog}
              className="gap-2 flex-1 sm:flex-initial"
            >
              <Trash2 className="h-4 w-4" />
              Delete ({selectedCategories.length})
            </Button>
          )}
          <Button onClick={openAddDialog} className="gap-2 flex-1 sm:flex-initial">
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border">
            <tr className="bg-muted/50">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-12 sm:w-16">
                <Checkbox
                  checked={
                    categories.length > 0 &&
                    selectedCategories.length === categories.length
                  }
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground min-w-[120px]">
                Category Name
              </th>
              <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground w-24 sm:w-32">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={3} className="h-24 text-center text-muted-foreground">
                  No categories found. Add your first category to get started.
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id} className="border-b border-border transition-colors hover:bg-muted/50">
                  <td className="p-4 align-middle">
                    <Checkbox
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={() => toggleCategorySelection(category.id)}
                      aria-label={`Select ${category.name}`}
                    />
                  </td>
                  <td className="p-4 align-middle font-medium">{category.name}</td>
                  <td className="p-4 align-middle text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(category)}
                      className="p-3"
                    >
                      <span className="hidden sm:block">Edit</span>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Dialog */}
      <AddEditCategoryDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={editCategory ? handleEditCategory : handleAddCategory}
        editCategory={editCategory}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedCategories.length}{" "}
              {selectedCategories.length === 1 ? "category" : "categories"}. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="m-0">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSelected}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 m-0 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
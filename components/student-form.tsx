"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Student } from "@/app/page"

interface StudentFormProps {
  student: Student | null
  onSave: (student: Student) => void
}

export function StudentForm({ student, onSave }: StudentFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    gender: "" as "Male" | "Female" | "",
    age: "",
    template: "G9-G12" as Student["template"],
  })

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        gender: student.gender,
        age: student.age.toString(),
        template: student.template,
      })
    } else {
      setFormData({
        name: "",
        gender: "",
        age: "",
        template: "G9-G12",
      })
    }
  }, [student])

  const calculateAcademicYears = (template: Student["template"]): string => {
    const currentYear = new Date().getFullYear()
    const templateYears = {
      "G9-G12": 4,
      "G10-G12": 3,
      "G11-G12": 2,
      G12: 1,
    }
    const years = templateYears[template]
    const startYear = currentYear - years + 1
    return `${startYear}-${currentYear}`
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.gender || !formData.age) {
      alert("Please fill in all fields")
      return
    }

    const studentData: Student = {
      id: student?.id || Date.now().toString(),
      name: formData.name,
      gender: formData.gender as "Male" | "Female",
      age: Number.parseInt(formData.age),
      template: formData.template,
      grades: student?.grades || [],
    }

    onSave(studentData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{student ? `Edit ${student.name}` : "New Student Information"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter student's full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, gender: value as "Male" | "Female" }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData((prev) => ({ ...prev, age: e.target.value }))}
                placeholder="Enter age"
                min="1"
                max="100"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template">Transcript Template</Label>
              <Select
                value={formData.template}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, template: value as Student["template"] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="G9-G12">G9–G12 (4 years)</SelectItem>
                  <SelectItem value="G10-G12">G10–G12 (3 years)</SelectItem>
                  <SelectItem value="G11-G12">G11–G12 (2 years)</SelectItem>
                  <SelectItem value="G12">G12 only (1 year)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Academic Years (Auto-calculated)</Label>
            <div className="p-3 bg-muted rounded-lg">
              <span className="font-mono">{calculateAcademicYears(formData.template)}</span>
              <p className="text-sm text-muted-foreground mt-1">
                Based on current year ({new Date().getFullYear()}) and selected template
              </p>
            </div>
          </div>

          <Button type="submit" className="w-full">
            {student ? "Update Student" : "Save Student"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Save } from "lucide-react"
import type { Student } from "@/app/page"

interface GradesInputProps {
  student: Student
  onSave: (student: Student) => void
}

const PREDEFINED_SUBJECTS = [
  "Amharic",
  "English",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Geography",
  "History",
  "Civics",
  "Economics",
  "Agriculture",
  "HPE",
  "ICT",
]

interface Grade {
  subject: string
  grades: {
    [gradeLevel: string]: {
      semester1: number
      semester2: number
      yearAvg: number
      total: number
      conduct: string
    }
  }
}

export function GradesInput({ student, onSave }: GradesInputProps) {
  console.log("[v0] GradesInput component loaded for student:", student?.name)
  console.log("[v0] Student grades data:", student?.grades)

  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  const getGradeLevels = (template: string): string[] => {
    switch (template) {
      case "G9-G12":
        return ["G9", "G10", "G11", "G12"]
      case "G10-G12":
        return ["G10", "G11", "G12"]
      case "G11-G12":
        return ["G11", "G12"]
      case "G12":
        return ["G12"]
      default:
        return ["G12"]
    }
  }

  const initializeGrades = (): Grade[] => {
    console.log("[v0] Initializing grades for template:", student?.template)

    if (!student || !student.template) {
      console.log("[v0] No student or template found, returning empty grades")
      return []
    }

    const gradeLevels = getGradeLevels(student.template)
    console.log("[v0] Grade levels for template:", gradeLevels)

    return PREDEFINED_SUBJECTS.map((subject) => {
      const existingGrade = student.grades?.find((g) => g.subject === subject)
      const grades: { [gradeLevel: string]: any } = {}

      gradeLevels.forEach((level) => {
        grades[level] = existingGrade?.grades?.[level] || {
          semester1: 0,
          semester2: 0,
          yearAvg: 0,
          total: 0,
          conduct: "Good",
        }
      })

      return {
        subject,
        grades,
      }
    })
  }

  const [grades, setGrades] = useState<Grade[]>([])

  useEffect(() => {
    console.log("[v0] useEffect triggered, student changed:", student?.name)
    try {
      const initializedGrades = initializeGrades()
      console.log("[v0] Initialized grades:", initializedGrades.length, "subjects")
      setGrades(initializedGrades)
    } catch (error) {
      console.error("[v0] Error initializing grades:", error)
      setGrades([])
    }
  }, [student])

  const calculateYearAvg = (sem1: number, sem2: number): number => {
    if (sem1 === 0 && sem2 === 0) return 0
    if (sem1 === 0) return Number(sem2.toFixed(2))
    if (sem2 === 0) return Number(sem1.toFixed(2))
    return Number(((sem1 + sem2) / 2).toFixed(2))
  }

  const validateGrade = (value: string): number => {
    const numValue = Number.parseFloat(value) || 0
    return Math.min(Math.max(numValue, 0), 100) // Limit between 0 and 100
  }

  const updateGrade = (subjectIndex: number, gradeLevel: string, field: string, value: string | number) => {
    console.log("[v0] Updating grade:", subjectIndex, gradeLevel, field, value)

    setGrades((prev) => {
      const updated = [...prev]

      if (subjectIndex < 0 || subjectIndex >= updated.length) {
        console.error("[v0] Invalid subject index:", subjectIndex)
        return prev
      }

      if (field === "conduct") {
        updated[subjectIndex].grades[gradeLevel].conduct = value as string
      } else {
        const numValue = typeof value === "string" ? validateGrade(value) : value
        updated[subjectIndex].grades[gradeLevel][field] = numValue

        // Auto-calculate year average and total with exact 2 decimal places
        const sem1 = updated[subjectIndex].grades[gradeLevel].semester1
        const sem2 = updated[subjectIndex].grades[gradeLevel].semester2
        updated[subjectIndex].grades[gradeLevel].yearAvg = calculateYearAvg(sem1, sem2)
        updated[subjectIndex].grades[gradeLevel].total = Number((sem1 + sem2).toFixed(2))
      }

      return updated
    })
  }

  const handleSave = (silent = false) => {
    console.log("[v0] Saving grades for student:", student?.name)

    try {
      const updatedStudent: Student = {
        ...student,
        grades,
      }
      onSave(updatedStudent)
      if (!silent) {
        alert("Grades saved successfully!")
      }
    } catch (error) {
      console.error("[v0] Error saving grades:", error)
      if (!silent) {
        alert("Error saving grades!")
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent, subjectIndex: number, gradeLevel: string, field: string) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSave(true) // Silent save without popup

      // Move to next input in the same section
      const currentKey = `${gradeLevel}-${subjectIndex}-${field}`
      let nextKey = ""

      if (field === "semester1") {
        nextKey = `${gradeLevel}-${subjectIndex}-semester2`
      } else if (field === "semester2") {
        // Move to next subject's semester1 in same grade level
        if (subjectIndex < PREDEFINED_SUBJECTS.length - 1) {
          nextKey = `${gradeLevel}-${subjectIndex + 1}-semester1`
        }
      }

      if (nextKey && inputRefs.current[nextKey]) {
        setTimeout(() => {
          inputRefs.current[nextKey]?.focus()
          inputRefs.current[nextKey]?.select()
        }, 100)
      }
    }
  }

  const calculateGradeLevelTotals = (gradeLevel: string) => {
    const totals = {
      semester1: 0,
      semester2: 0,
      yearAvg: 0,
      total: 0,
      conductCounts: { Excellent: 0, Good: 0, Satisfactory: 0, "Needs Improvement": 0 },
    }

    grades.forEach((grade) => {
      const gradeData = grade.grades[gradeLevel]
      if (gradeData) {
        totals.semester1 += gradeData.semester1
        totals.semester2 += gradeData.semester2
        totals.yearAvg += gradeData.yearAvg
        totals.total += gradeData.total
        totals.conductCounts[gradeData.conduct as keyof typeof totals.conductCounts]++
      }
    })

    // Get most common conduct
    const mostCommonConduct = Object.entries(totals.conductCounts).reduce((a, b) =>
      totals.conductCounts[a[0] as keyof typeof totals.conductCounts] >
      totals.conductCounts[b[0] as keyof typeof totals.conductCounts]
        ? a
        : b,
    )[0]

    return {
      semester1: Number(totals.semester1.toFixed(2)),
      semester2: Number(totals.semester2.toFixed(2)),
      yearAvg: Number(totals.yearAvg.toFixed(2)),
      total: Number(totals.total.toFixed(2)),
      conduct: mostCommonConduct,
    }
  }

  if (!student) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No student selected</p>
        </CardContent>
      </Card>
    )
  }

  if (grades.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Loading grades...</p>
        </CardContent>
      </Card>
    )
  }

  const gradeLevels = getGradeLevels(student.template)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Grades for {student.name}</span>
          <div className="text-sm text-muted-foreground">Template: {student.template}</div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {gradeLevels.map((gradeLevel) => {
          const levelTotals = calculateGradeLevelTotals(gradeLevel)

          return (
            <div key={gradeLevel} className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">{gradeLevel} Academic Record</h3>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Subject</TableHead>
                      <TableHead className="text-center">Sem 1</TableHead>
                      <TableHead className="text-center">Sem 2</TableHead>
                      <TableHead className="text-center">Year Avg</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                      <TableHead className="text-center">Conduct</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grades.map((grade, index) => (
                      <TableRow key={`${gradeLevel}-${grade.subject}`}>
                        <TableCell className="font-medium">{grade.subject}</TableCell>
                        <TableCell>
                          <Input
                            ref={(el) => {
                              inputRefs.current[`${gradeLevel}-${index}-semester1`] = el
                            }}
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={grade.grades[gradeLevel]?.semester1 || ""}
                            onChange={(e) => updateGrade(index, gradeLevel, "semester1", e.target.value)}
                            onKeyPress={(e) => handleKeyPress(e, index, gradeLevel, "semester1")}
                            className="text-center border-0 p-2 focus:ring-1 font-mono"
                            placeholder="0.00"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            ref={(el) => {
                              inputRefs.current[`${gradeLevel}-${index}-semester2`] = el
                            }}
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={grade.grades[gradeLevel]?.semester2 || ""}
                            onChange={(e) => updateGrade(index, gradeLevel, "semester2", e.target.value)}
                            onKeyPress={(e) => handleKeyPress(e, index, gradeLevel, "semester2")}
                            className="text-center border-0 p-2 focus:ring-1 font-mono"
                            placeholder="0.00"
                          />
                        </TableCell>
                        <TableCell className="text-center font-mono font-semibold">
                          {grade.grades[gradeLevel]?.yearAvg > 0
                            ? `${grade.grades[gradeLevel].yearAvg.toFixed(2)}`
                            : "-"}
                        </TableCell>
                        <TableCell className="text-center font-mono">
                          {grade.grades[gradeLevel]?.total > 0 ? grade.grades[gradeLevel].total.toFixed(2) : "-"}
                        </TableCell>
                        <TableCell>
                          <select
                            value={grade.grades[gradeLevel]?.conduct || "Good"}
                            onChange={(e) => updateGrade(index, gradeLevel, "conduct", e.target.value)}
                            className="w-full p-1 border rounded text-center"
                          >
                            <option value="Excellent">Excellent</option>
                            <option value="Good">Good</option>
                            <option value="Satisfactory">Satisfactory</option>
                            <option value="Needs Improvement">Needs Improvement</option>
                          </select>
                        </TableCell>
                      </TableRow>
                    ))}

                    <TableRow className="bg-muted/50 font-semibold border-t-2">
                      <TableCell className="font-bold">TOTALS</TableCell>
                      <TableCell className="text-center font-mono">{levelTotals.semester1.toFixed(2)}</TableCell>
                      <TableCell className="text-center font-mono">{levelTotals.semester2.toFixed(2)}</TableCell>
                      <TableCell className="text-center font-mono">{levelTotals.yearAvg.toFixed(2)}</TableCell>
                      <TableCell className="text-center font-mono">{levelTotals.total.toFixed(2)}</TableCell>
                      <TableCell className="text-center">{levelTotals.conduct}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )
        })}

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => handleSave(false)} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save All Grades
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

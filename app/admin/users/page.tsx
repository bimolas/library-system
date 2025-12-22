"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  UserCircle,
  Mail,
  Award,
  AlertCircle,
  Eye,
  Ban,
  CheckCircle,
  Clock,
  X,
  UserPlus,
  Timer,
} from "lucide-react"
import { useNotification } from "@/lib/notification-context"
import { useConfirmation } from "@/components/confirmation-modal"
import Link from "next/link"

interface User {
  id: string
  name: string
  email: string
  level: string
  score: number
  activeBorrows: number
  totalBorrows: number
  onTimeRate: number
  status: "active" | "suspended" | "warning" | "banned"
  joinDate: Date
  customBorrowDays?: number
  banExpiry?: Date
  banReason?: string
  penalties: number
  bonuses: number
}

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showBanModal, setShowBanModal] = useState(false)
  const [showCustomTimeModal, setShowCustomTimeModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [banDuration, setBanDuration] = useState("7")
  const [banReason, setBanReason] = useState("")
  const [customBorrowDays, setCustomBorrowDays] = useState("14")
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "student" })
  const { showNotification } = useNotification()
  const { confirm } = useConfirmation()

  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      level: "platinum",
      score: 12450,
      activeBorrows: 3,
      totalBorrows: 48,
      onTimeRate: 98,
      status: "active",
      joinDate: new Date(2023, 5, 15),
      penalties: 0,
      bonuses: 5,
    },
    {
      id: "2",
      name: "Michael Chen",
      email: "michael.chen@example.com",
      level: "gold",
      score: 8720,
      activeBorrows: 2,
      totalBorrows: 32,
      onTimeRate: 95,
      status: "active",
      joinDate: new Date(2023, 8, 22),
      customBorrowDays: 21,
      penalties: 1,
      bonuses: 3,
    },
    {
      id: "3",
      name: "Emma Davis",
      email: "emma.davis@example.com",
      level: "silver",
      score: 5240,
      activeBorrows: 1,
      totalBorrows: 18,
      onTimeRate: 87,
      status: "warning",
      joinDate: new Date(2024, 1, 10),
      penalties: 3,
      bonuses: 1,
    },
    {
      id: "4",
      name: "James Wilson",
      email: "james.wilson@example.com",
      level: "bronze",
      score: 2180,
      activeBorrows: 1,
      totalBorrows: 9,
      onTimeRate: 92,
      status: "active",
      joinDate: new Date(2024, 8, 5),
      penalties: 0,
      bonuses: 0,
    },
    {
      id: "5",
      name: "Lisa Thompson",
      email: "lisa.thompson@example.com",
      level: "bronze",
      score: 800,
      activeBorrows: 0,
      totalBorrows: 5,
      onTimeRate: 60,
      status: "banned",
      joinDate: new Date(2024, 6, 20),
      banExpiry: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      banReason: "Multiple late returns and damaged book",
      penalties: 8,
      bonuses: 0,
    },
  ])

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const levelColors = {
    platinum: "bg-purple-500/10 text-purple-600 border-purple-500/30",
    gold: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    silver: "bg-slate-400/10 text-slate-500 border-slate-400/30",
    bronze: "bg-orange-700/10 text-orange-700 border-orange-700/30",
  }

  const statusColors = {
    active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
    warning: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    suspended: "bg-orange-500/10 text-orange-600 border-orange-500/30",
    banned: "bg-red-500/10 text-red-600 border-red-500/30",
  }

  const handleTemporaryBan = (user: User) => {
    setSelectedUser(user)
    setShowBanModal(true)
  }

  const confirmBan = async () => {
    if (!selectedUser) return

    const days = Number.parseInt(banDuration)
    const expiry = new Date(Date.now() + days * 24 * 60 * 60 * 1000)

    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id
          ? { ...u, status: "banned" as const, banExpiry: expiry, banReason: banReason || "Policy violation" }
          : u,
      ),
    )

    showNotification(`${selectedUser.name} has been banned for ${days} days.`, "info")
    setShowBanModal(false)
    setBanDuration("7")
    setBanReason("")
    setSelectedUser(null)
  }

  const handleUnban = async (user: User) => {
    const confirmed = await confirm({
      title: "Unban User",
      message: `Are you sure you want to unban ${user.name}? They will regain full library access.`,
      confirmText: "Unban",
      cancelText: "Cancel",
      variant: "default",
    })

    if (confirmed) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, status: "active" as const, banExpiry: undefined, banReason: undefined } : u,
        ),
      )
      showNotification(`${user.name} has been unbanned.`, "success")
    }
  }

  const handleSetCustomTime = (user: User) => {
    setSelectedUser(user)
    setCustomBorrowDays(user.customBorrowDays?.toString() || "14")
    setShowCustomTimeModal(true)
  }

  const confirmCustomTime = () => {
    if (!selectedUser) return

    const days = Number.parseInt(customBorrowDays)
    setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? { ...u, customBorrowDays: days } : u)))

    showNotification(`Custom borrow time of ${days} days set for ${selectedUser.name}.`, "success")
    setShowCustomTimeModal(false)
    setSelectedUser(null)
  }

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) {
      showNotification("Please fill in all required fields.", "error")
      return
    }

    const user: User = {
      id: `user-${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      level: "bronze",
      score: 0,
      activeBorrows: 0,
      totalBorrows: 0,
      onTimeRate: 100,
      status: "active",
      joinDate: new Date(),
      penalties: 0,
      bonuses: 0,
    }

    setUsers((prev) => [...prev, user])
    showNotification(`${newUser.name} has been added successfully.`, "success")
    setShowAddModal(false)
    setNewUser({ name: "", email: "", role: "student" })
  }

  const activeUsers = users.filter((u) => u.status === "active").length
  const bannedUsers = users.filter((u) => u.status === "banned").length
  const warningUsers = users.filter((u) => u.status === "warning").length

  return (
    <div className="min-h-screen bg-background page-container">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fadeIn">
          <div>
            <h1 className="text-3xl font-bold mb-2">User Management</h1>
            <p className="text-muted-foreground">Monitor users, manage permissions, and configure borrowing settings</p>
          </div>
          <Button className="gap-2 hover-lift" onClick={() => setShowAddModal(true)}>
            <UserPlus className="w-4 h-4" />
            Add New User
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 border-border animate-slideIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <UserCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border-border animate-slideIn" style={{ animationDelay: "50ms" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeUsers}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border-border animate-slideIn" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{warningUsers}</p>
                <p className="text-sm text-muted-foreground">Warnings</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border-border animate-slideIn" style={{ animationDelay: "150ms" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Ban className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{bannedUsers}</p>
                <p className="text-sm text-muted-foreground">Banned</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search */}
        <Card className="p-4 border-border mb-6 animate-fadeIn">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-border focus:border-primary transition-smooth"
            />
          </div>
        </Card>

        {/* Users Table */}
        <Card className="border-border overflow-hidden animate-slideIn">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-4 px-4 font-semibold">User</th>
                  <th className="text-center py-4 px-4 font-semibold">Level</th>
                  <th className="text-center py-4 px-4 font-semibold">Score</th>
                  <th className="text-center py-4 px-4 font-semibold">Borrows</th>
                  <th className="text-center py-4 px-4 font-semibold">On-Time</th>
                  <th className="text-center py-4 px-4 font-semibold">Borrow Days</th>
                  <th className="text-center py-4 px-4 font-semibold">Status</th>
                  <th className="text-center py-4 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr
                    key={user.id}
                    className="border-b border-border hover:bg-muted/30 transition-smooth animate-fadeIn"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <UserCircle className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{user.name}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-4 px-4">
                      <Badge className={levelColors[user.level as keyof typeof levelColors]}>
                        <Award className="w-3 h-3 mr-1" />
                        {user.level}
                      </Badge>
                    </td>
                    <td className="text-center py-4 px-4">
                      <p className="font-semibold text-primary">{user.score.toLocaleString()}</p>
                    </td>
                    <td className="text-center py-4 px-4">
                      <div>
                        <p className="font-semibold">{user.activeBorrows} active</p>
                        <p className="text-xs text-muted-foreground">{user.totalBorrows} total</p>
                      </div>
                    </td>
                    <td className="text-center py-4 px-4">
                      <Badge
                        className={
                          user.onTimeRate >= 95
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                            : user.onTimeRate >= 85
                              ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                              : "bg-red-500/10 text-red-600 border-red-500/30"
                        }
                      >
                        {user.onTimeRate}%
                      </Badge>
                    </td>
                    <td className="text-center py-4 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <Timer className="w-3 h-3 text-muted-foreground" />
                        <span
                          className={user.customBorrowDays ? "text-primary font-semibold" : "text-muted-foreground"}
                        >
                          {user.customBorrowDays || 14} days
                        </span>
                      </div>
                    </td>
                    <td className="text-center py-4 px-4">
                      <Badge className={statusColors[user.status]}>
                        {user.status === "active" ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : user.status === "banned" ? (
                          <Ban className="w-3 h-3 mr-1" />
                        ) : (
                          <AlertCircle className="w-3 h-3 mr-1" />
                        )}
                        {user.status}
                      </Badge>
                      {user.banExpiry && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Until {user.banExpiry.toLocaleDateString()}
                        </p>
                      )}
                    </td>
                    <td className="text-center py-4 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/admin/users/${user.id}`}>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover-lift" title="View Details">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover-lift"
                          onClick={() => handleSetCustomTime(user)}
                          title="Set Custom Borrow Time"
                        >
                          <Clock className="w-4 h-4" />
                        </Button>
                        {user.status === "banned" ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover-lift"
                            onClick={() => handleUnban(user)}
                            title="Unban User"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover-lift"
                            onClick={() => handleTemporaryBan(user)}
                            title="Temporary Ban"
                          >
                            <Ban className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Add User Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <Card className="w-full max-w-md border-border shadow-2xl animate-scaleIn">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <UserPlus className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold">Add New User</h2>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowAddModal(false)}
                    className="h-8 w-8 p-0 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Full Name</label>
                    <Input
                      placeholder="Enter full name"
                      value={newUser.name}
                      onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))}
                      className="bg-background border-border"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email Address</label>
                    <Input
                      type="email"
                      placeholder="Enter email address"
                      value={newUser.email}
                      onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
                      className="bg-background border-border"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Role</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser((prev) => ({ ...prev, role: e.target.value }))}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:border-primary transition-smooth"
                    >
                      <option value="student">Student</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1 bg-transparent">
                      Cancel
                    </Button>
                    <Button className="flex-1 hover-lift" onClick={handleAddUser}>
                      Add User
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Temporary Ban Modal */}
        {showBanModal && selectedUser && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <Card className="w-full max-w-md border-border shadow-2xl animate-scaleIn">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <Ban className="w-5 h-5 text-red-600" />
                    </div>
                    <h2 className="text-xl font-bold">Temporary Ban</h2>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowBanModal(false)}
                    className="h-8 w-8 p-0 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                  <p className="font-medium">{selectedUser.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Ban Duration</label>
                    <select
                      value={banDuration}
                      onChange={(e) => setBanDuration(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:border-primary transition-smooth"
                    >
                      <option value="1">1 day</option>
                      <option value="3">3 days</option>
                      <option value="7">7 days</option>
                      <option value="14">14 days</option>
                      <option value="30">30 days</option>
                      <option value="90">90 days</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Reason for Ban</label>
                    <textarea
                      value={banReason}
                      onChange={(e) => setBanReason(e.target.value)}
                      placeholder="Enter reason for the ban..."
                      className="w-full min-h-[80px] px-3 py-2 rounded-lg border border-border bg-background focus:border-primary transition-smooth resize-none"
                    />
                  </div>

                  <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                    <p className="text-sm text-red-600">
                      This user will be unable to borrow or reserve books until the ban expires.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" onClick={() => setShowBanModal(false)} className="flex-1 bg-transparent">
                      Cancel
                    </Button>
                    <Button variant="destructive" className="flex-1 hover-lift" onClick={confirmBan}>
                      Confirm Ban
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Custom Borrow Time Modal */}
        {showCustomTimeModal && selectedUser && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <Card className="w-full max-w-md border-border shadow-2xl animate-scaleIn">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold">Custom Borrow Time</h2>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowCustomTimeModal(false)}
                    className="h-8 w-8 p-0 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                  <p className="font-medium">{selectedUser.name}</p>
                  <p className="text-sm text-muted-foreground">Current: {selectedUser.customBorrowDays || 14} days</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">New Borrow Duration (days)</label>
                    <Input
                      type="number"
                      min="7"
                      max="60"
                      value={customBorrowDays}
                      onChange={(e) => setCustomBorrowDays(e.target.value)}
                      className="bg-background border-border"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Min: 7 days, Max: 60 days</p>
                  </div>

                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                    <p className="text-sm text-primary">
                      This custom duration will override the default borrowing time for this user.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowCustomTimeModal(false)}
                      className="flex-1 bg-transparent"
                    >
                      Cancel
                    </Button>
                    <Button className="flex-1 hover-lift" onClick={confirmCustomTime}>
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}

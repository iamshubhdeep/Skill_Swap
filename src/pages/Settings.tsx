import React from 'react'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { Settings as SettingsIcon, Bell, Shield, Database } from 'lucide-react'

export function Settings() {
  const { signOut } = useAuth()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account preferences and privacy settings</p>
      </div>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <SettingsIcon className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Account Settings</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3">
              <div>
                <h3 className="font-medium text-gray-900">Email Notifications</h3>
                <p className="text-sm text-gray-600">Receive emails about swap requests and updates</p>
              </div>
              <input type="checkbox" className="toggle" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between py-3">
              <div>
                <h3 className="font-medium text-gray-900">Profile Visibility</h3>
                <p className="text-sm text-gray-600">Allow others to find and view your profile</p>
              </div>
              <input type="checkbox" className="toggle" defaultChecked />
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <h3 className="font-medium text-gray-900">Show Availability</h3>
                <p className="text-sm text-gray-600">Display your availability times to other users</p>
              </div>
              <input type="checkbox" className="toggle" defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Privacy & Security</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-600 mb-3">Add an extra layer of security to your account</p>
              <Button variant="secondary" size="sm">Enable 2FA</Button>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Login Activity</h3>
              <p className="text-sm text-gray-600 mb-3">Review recent login activity and devices</p>
              <Button variant="secondary" size="sm">View Activity</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Data Management</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Export Data</h3>
              <p className="text-sm text-gray-600 mb-3">Download a copy of your account data</p>
              <Button variant="secondary" size="sm">Request Export</Button>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Delete Account</h3>
              <p className="text-sm text-gray-600 mb-3">Permanently delete your account and all data</p>
              <Button variant="danger" size="sm">Delete Account</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Sign Out</h3>
              <p className="text-sm text-gray-600">Sign out of your account on this device</p>
            </div>
            <Button variant="secondary" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
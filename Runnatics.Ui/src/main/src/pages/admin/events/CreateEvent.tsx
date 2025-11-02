import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Plus,
  Trash2,
  Save,
  X,
  AlertCircle,
  Globe,
  Settings as SettingsIcon,
} from "lucide-react";
import { eventService } from "../../../services/EventService";
import {
  CreateEventFormData,
  CreateEventRequest,
  EventStatus,
} from "../../../models";
//import { useAuthStore } from "../../stores/auth.store";
import { toast } from "react-hot-toast";

interface CreateEventFormProps {
  organizationId: number;
  onSuccess?: (eventId: number) => void;
  onCancel?: () => void;
}

const EVENT_STATUSES: EventStatus[] = [
  "Draft",
  "Published",
  "InProgress",
  "Completed",
  "Cancelled",
];

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Pacific/Auckland",
];

export const CreateEventForm: React.FC<CreateEventFormProps> = ({
  organizationId,
  onSuccess,
  onCancel,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  //const { user } = useAuthStore();
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(true);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateEventFormData>({
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      eventDate: "",
      timeZone: "UTC",
      status: "Draft",
      venueName: "",
      venueAddress: "",
      venueLatitude: "",
      venueLongitude: "",
      maxParticipants: "",
      registrationDeadline: "",
      organizers: [{ name: "" }],
      allowWaitlist: false,
      autoConfirmRegistrations: true,
      requireApproval: false,
      emailNotifications: true,
      smsNotifications: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "organizers",
  });

  // Watch name field to auto-generate slug
  const nameValue = watch("name");

  useEffect(() => {
    if (isGeneratingSlug && nameValue) {
      const slug = eventService.generateSlug(nameValue);
      setValue("slug", slug);
    }
  }, [nameValue, isGeneratingSlug, setValue]);

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (data: CreateEventFormData) => {
      // Prepare the data for API
      const eventInput: CreateEventRequest = {
        organizationId,
        name: data.name,
        slug: data.slug,
        description: data.description || undefined,
        eventDate: new Date(data.eventDate).toISOString(),
        timeZone: data.timeZone,
        venueName: data.venueName || undefined,
        venueAddress: data.venueAddress || undefined,
        venueLatitude: data.venueLatitude
          ? parseFloat(data.venueLatitude)
          : undefined,
        venueLongitude: data.venueLongitude
          ? parseFloat(data.venueLongitude)
          : undefined,
        status: data.status,
        maxParticipants: data.maxParticipants
          ? parseInt(data.maxParticipants)
          : undefined,
        registrationDeadline: data.registrationDeadline
          ? new Date(data.registrationDeadline).toISOString()
          : undefined,
        settings: {
          allowWaitlist: data.allowWaitlist,
          autoConfirmRegistrations: data.autoConfirmRegistrations,
          requireApproval: data.requireApproval,
          emailNotifications: data.emailNotifications,
          smsNotifications: data.smsNotifications,
        },
        organizers: data.organizers
          .map((org) => org.name.trim())
          .filter((name) => name.length > 0),
      };

      return eventService.createEvent(eventInput);
    },
    onSuccess: (data) => {
      toast.success("Event created successfully!");
      queryClient.invalidateQueries({ queryKey: ["events", organizationId] });

      if (onSuccess) {
        onSuccess(data.id);
      } else {
        navigate(`/events/${data.id}`);
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to create event";
      toast.error(message);
    },
  });

  const onSubmit = (data: CreateEventFormData) => {
    createEventMutation.mutate(data);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate("/events");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
        <p className="mt-2 text-sm text-gray-600">
          Fill in the details below to create a new event for your organization.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Calendar className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">
              Basic Information
            </h2>
          </div>

          <div className="space-y-4">
            {/* Event Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Event Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                {...register("name", {
                  required: "Event name is required",
                  maxLength: {
                    value: 255,
                    message: "Name must be less than 255 characters",
                  },
                })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g., Summer Marathon 2025"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Slug */}
            <div>
              <label
                htmlFor="slug"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                URL Slug <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-2">
                <input
                  id="slug"
                  type="text"
                  {...register("slug", {
                    required: "Slug is required",
                    maxLength: {
                      value: 100,
                      message: "Slug must be less than 100 characters",
                    },
                    pattern: {
                      value: /^[a-z0-9-]+$/,
                      message:
                        "Slug can only contain lowercase letters, numbers, and hyphens",
                    },
                  })}
                  onChange={(e) => {
                    setIsGeneratingSlug(false);
                    register("slug").onChange(e);
                  }}
                  className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.slug ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="summer-marathon-2025"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsGeneratingSlug(true);
                    if (nameValue) {
                      setValue("slug", eventService.generateSlug(nameValue));
                    }
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
                >
                  Auto-generate
                </button>
              </div>
              {errors.slug && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.slug.message}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                This will be used in the event URL: /events/
                {watch("slug") || "your-slug"}
              </p>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                {...register("description")}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Provide a detailed description of your event..."
              />
            </div>

            {/* Event Date and Time Zone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="eventDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Event Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  id="eventDate"
                  type="datetime-local"
                  {...register("eventDate", {
                    required: "Event date is required",
                  })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.eventDate ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.eventDate && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.eventDate.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="timeZone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Time Zone <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    id="timeZone"
                    {...register("timeZone", {
                      required: "Time zone is required",
                    })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                {...register("status", { required: "Status is required" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {EVENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Venue Information Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <MapPin className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">
              Venue Information
            </h2>
          </div>

          <div className="space-y-4">
            {/* Venue Name */}
            <div>
              <label
                htmlFor="venueName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Venue Name
              </label>
              <input
                id="venueName"
                type="text"
                {...register("venueName", {
                  maxLength: {
                    value: 255,
                    message: "Venue name must be less than 255 characters",
                  },
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Central Park"
              />
            </div>

            {/* Venue Address */}
            <div>
              <label
                htmlFor="venueAddress"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Venue Address
              </label>
              <textarea
                id="venueAddress"
                {...register("venueAddress")}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter the full address of the venue"
              />
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="venueLatitude"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Latitude
                </label>
                <input
                  id="venueLatitude"
                  type="number"
                  step="any"
                  {...register("venueLatitude", {
                    validate: (value) => {
                      if (
                        value &&
                        (parseFloat(value) < -90 || parseFloat(value) > 90)
                      ) {
                        return "Latitude must be between -90 and 90";
                      }
                      return true;
                    },
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 40.785091"
                />
                {errors.venueLatitude && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.venueLatitude.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="venueLongitude"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Longitude
                </label>
                <input
                  id="venueLongitude"
                  type="number"
                  step="any"
                  {...register("venueLongitude", {
                    validate: (value) => {
                      if (
                        value &&
                        (parseFloat(value) < -180 || parseFloat(value) > 180)
                      ) {
                        return "Longitude must be between -180 and 180";
                      }
                      return true;
                    },
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., -73.968285"
                />
                {errors.venueLongitude && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.venueLongitude.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Registration Settings Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Users className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">
              Registration Settings
            </h2>
          </div>

          <div className="space-y-4">
            {/* Max Participants */}
            <div>
              <label
                htmlFor="maxParticipants"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Maximum Participants
              </label>
              <input
                id="maxParticipants"
                type="number"
                min="1"
                {...register("maxParticipants", {
                  validate: (value) => {
                    if (value && parseInt(value) < 1) {
                      return "Maximum participants must be at least 1";
                    }
                    return true;
                  },
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Leave empty for unlimited"
              />
              {errors.maxParticipants && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.maxParticipants.message}
                </p>
              )}
            </div>

            {/* Registration Deadline */}
            <div>
              <label
                htmlFor="registrationDeadline"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Registration Deadline
              </label>
              <input
                id="registrationDeadline"
                type="datetime-local"
                {...register("registrationDeadline")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                Leave empty to allow registrations until the event starts
              </p>
            </div>
          </div>
        </div>

        {/* Event Organizers Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                Event Organizers
              </h2>
            </div>
            <button
              type="button"
              onClick={() => append({ name: "" })}
              className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Organizer
            </button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-2">
                <input
                  {...register(`organizers.${index}.name` as const, {
                    maxLength: {
                      value: 255,
                      message: "Name must be less than 255 characters",
                    },
                  })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Organizer name"
                />
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Advanced Settings Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <SettingsIcon className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">
              Advanced Settings
            </h2>
          </div>

          <div className="space-y-3">
            {/* Allow Waitlist */}
            <div className="flex items-center">
              <input
                id="allowWaitlist"
                type="checkbox"
                {...register("allowWaitlist")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="allowWaitlist"
                className="ml-2 block text-sm text-gray-900"
              >
                Allow waitlist when event is full
              </label>
            </div>

            {/* Auto-confirm Registrations */}
            <div className="flex items-center">
              <input
                id="autoConfirmRegistrations"
                type="checkbox"
                {...register("autoConfirmRegistrations")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="autoConfirmRegistrations"
                className="ml-2 block text-sm text-gray-900"
              >
                Automatically confirm registrations
              </label>
            </div>

            {/* Require Approval */}
            <div className="flex items-center">
              <input
                id="requireApproval"
                type="checkbox"
                {...register("requireApproval")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="requireApproval"
                className="ml-2 block text-sm text-gray-900"
              >
                Require manual approval for registrations
              </label>
            </div>

            {/* Email Notifications */}
            <div className="flex items-center">
              <input
                id="emailNotifications"
                type="checkbox"
                {...register("emailNotifications")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="emailNotifications"
                className="ml-2 block text-sm text-gray-900"
              >
                Send email notifications to participants
              </label>
            </div>

            {/* SMS Notifications */}
            <div className="flex items-center">
              <input
                id="smsNotifications"
                type="checkbox"
                {...register("smsNotifications")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="smsNotifications"
                className="ml-2 block text-sm text-gray-900"
              >
                Send SMS notifications to participants
              </label>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="h-4 w-4 inline mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Event
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

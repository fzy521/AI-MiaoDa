              <FileText className="text-primary" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">日报管理</h2>
              <p className="text-xs text-muted-foreground">当前角色: {ROLE_LABELS[currentRole]}</p>
          </div>
          <button
            onClick={() => setShowRoleSelector(!showRoleSelector)}
            className="px-4 py-2 rounded-full text-sm font-medium bg-muted/50 text-muted-foreground hover:bg-muted transition-colors flex items-center gap-2"
          >
            <Clock size={16} /> 切换角色
            {showRoleSelector ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
        {showRoleSelector && (
          <div className="mt-4 pt-4 border-t border-border">
            <RoleSelector />
        )}
      </div>

      {/* Role Content */}
      {roleView()}
    </div>
  );
}